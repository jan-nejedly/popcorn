import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import * as cookieSession from 'cookie-session';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RatingsModule } from './ratings/ratings.module';
import { FollowersModule } from './followers/followers.module';

@Module({
  imports: [
    MoviesModule,
    UsersModule,
    ConfigModule.forRoot(),
    RatingsModule,
    FollowersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          name: 'session',
          keys: [this.configService.get<string>('COOKIE_KEY')],
          maxAge: 24 * 60 * 60 * 1000,
        }),
      )
      .forRoutes('*');
  }
}

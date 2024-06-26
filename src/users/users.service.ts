import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/db';
import {
  usersTable,
  SelectUser,
  userMovieStatistics,
  followersTable,
  ratingsTable,
} from '../db/schema';
import {
  and,
  eq,
  getTableColumns,
  ilike,
  ne,
  sql,
  count,
  inArray,
} from 'drizzle-orm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);
export type SelectUserWithoutPassword = Omit<SelectUser, 'password'>;

@Injectable()
export class UsersService {
  async findAll(): Promise<SelectUser[]> {
    return db.select(getTableColumns(usersTable)).from(usersTable);
  }

  async findByName(name: string): Promise<SelectUser | void> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.name, name));

    if (user.length > 0) return user[0];

    return null;
  }

  async findById(id: number): Promise<SelectUser | void> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (user.length > 0) return user[0];

    return null;
  }

  async searchByName(query: string, curUserId: number): Promise<any> {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        totalRuntime:
          sql<number>`COALESCE(${userMovieStatistics.totalRuntime}, 0)`.as(
            'total_runtime',
          ),
        movieCount:
          sql<number>`COALESCE(${userMovieStatistics.movieCount}, 0)`.as(
            'movie_count',
          ),
        averageStars:
          sql<number>`COALESCE(${userMovieStatistics.averageStars}, 0)`.as(
            'average_stars',
          ),
      })
      .from(usersTable)
      .leftJoin(
        userMovieStatistics,
        eq(usersTable.id, userMovieStatistics.userId),
      )
      .where(
        and(ilike(usersTable.name, `%${query}%`), ne(usersTable.id, curUserId)),
      )
      .limit(10);

    if (users.length > 0) return users;

    return null;
  }

  async register(name: string, password: string, passwordConfirm: string) {
    const nameTaken = await this.findByName(name);

    if (nameTaken) {
      throw new BadRequestException('Name already taken');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password too short');
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords not matching');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    const user = await db
      .insert(usersTable)
      .values({ name, password: hashedPassword })
      .returning();

    return user[0];
  }

  async login(name: string, password: string) {
    const user = await this.findByName(name);

    if (!user) throw new NotFoundException('User not found');

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  async getUserMoviesStatistics(userId: number): Promise<any> {
    const userMovStatistics = await db
      .select()
      .from(userMovieStatistics)
      .where(eq(userMovieStatistics.userId, userId));

    if (userMovStatistics.length > 0) {
      return userMovStatistics[0];
    } else {
      return {
        userId: userId,
        totalRuntime: 0,
        movieCount: 0,
        averageStars: 0,
      };
    }
  }

  async getUserFollowersStatistics(userId: number): Promise<any> {
    const userFollowersWatchedSameMovies = await db
      .select({
        followersCount: sql<number>`COUNT(DISTINCT ${followersTable.followerId})`,
      })
      .from(followersTable)
      .innerJoin(
        ratingsTable,
        eq(followersTable.followerId, ratingsTable.userId),
      )
      .where(
        and(
          eq(followersTable.userId, userId),
          inArray(
            ratingsTable.movieId,
            db
              .select({
                movieId: ratingsTable.movieId,
              })
              .from(ratingsTable)
              .where(eq(ratingsTable.userId, userId)),
          ),
        ),
      );

    return userFollowersWatchedSameMovies[0];
  }
}

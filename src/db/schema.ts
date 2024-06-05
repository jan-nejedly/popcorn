import { eq, sql } from 'drizzle-orm';
import { integer, pgTable, pgView, serial, text } from 'drizzle-orm/pg-core';
import { TypedQueryBuilder } from 'drizzle-orm/query-builders/query-builder';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

export const moviesTable = pgTable('movies', {
  id: serial('id').primaryKey(),
  imdbID: text('imdb_id').notNull().unique(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  year: text('year').notNull(),
  poster: text('poster').notNull(),
  runtime: text('runtime').notNull(),
  genre: text('genre').notNull(),
  imdbRating: text('imdb_rating').notNull(),
  plot: text('plot').notNull(),
  actors: text('actors').notNull(),
  director: text('director').notNull(),
});

export const ratingsTable = pgTable('ratings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id')
    .notNull()
    .references(() => moviesTable.id, { onDelete: 'cascade' }),
  stars: integer('stars').notNull(),
});

export const followersTable = pgTable('followers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  followerId: integer('follower_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const userMovieStatistics = pgView("user_movie_statistics").as((qb): TypedQueryBuilder<any> => {
  return qb
    .select({
      userId: ratingsTable.userId,
      totalRuntime: sql<number>`SUM(CAST(REGEXP_REPLACE(${moviesTable.runtime}, '[^0-9]', '', 'g') AS INTEGER))`,
      movieCount: sql<number>`COUNT(${ratingsTable.movieId})`,
      averageStars: sql<number>`ROUND(AVG(${ratingsTable.stars})::numeric, 1)`
    })
    .from(ratingsTable)
    .innerJoin(moviesTable, eq(ratingsTable.movieId, moviesTable.id))
    .groupBy(ratingsTable.userId);
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertMovie = typeof moviesTable.$inferInsert;
export type SelectMovie = typeof moviesTable.$inferSelect;

export type InsertRating = typeof ratingsTable.$inferInsert;
export type SelectRating = typeof ratingsTable.$inferSelect;

export type InsertFollower = typeof followersTable.$inferInsert;
export type SelectFollower = typeof followersTable.$inferSelect;

export type SelectMovieWithRating = SelectMovie & { ratingId: SelectRating['id'], stars: SelectRating['stars'] };
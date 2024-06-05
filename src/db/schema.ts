import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

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

export const friendsTable = pgTable('friends', {
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  friendId: integer('friend_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertMovie = typeof moviesTable.$inferInsert;
export type SelectMovie = typeof moviesTable.$inferSelect;

export type InsertRating = typeof ratingsTable.$inferInsert;
export type SelectRating = typeof ratingsTable.$inferSelect;

export type InsertFriend = typeof friendsTable.$inferInsert;
export type SelectFriend = typeof friendsTable.$inferSelect;

export type SelectMovieWithRating = SelectMovie & {
  ratingId: SelectRating['id'];
  stars: SelectRating['stars'];
};

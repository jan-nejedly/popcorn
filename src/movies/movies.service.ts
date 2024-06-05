import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import {
  InsertMovie,
  moviesTable,
  ratingsTable,
  SelectMovie,
  SelectMovieWithRating,
} from '../db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import axios from 'axios';

@Injectable()
export class MoviesService {
  async findAll(): Promise<SelectMovie[]> {
    return db.select(getTableColumns(moviesTable)).from(moviesTable);
  }

  async findByImdbID(imdbID: string): Promise<SelectMovie | void> {
    const movie = await db
      .select()
      .from(moviesTable)
      .where(eq(moviesTable.imdbID, imdbID));

    if (movie.length > 0) return movie[0];

    return await this.createFromOmdb(imdbID);
  }

  async createFromOmdb(imdbID: string): Promise<SelectMovie> {
    const response = await axios.get('http://www.omdbapi.com', {
      params: {
        i: imdbID,
        apiKey: process.env.OMDB_API_KEY,
      },
    });

    const movieData: InsertMovie = {
      title: response.data.Title,
      year: response.data.Year,
      plot: response.data.Plot,
      genre: response.data.Genre,
      imdbID: response.data.imdbID,
      type: response.data.Type,
      poster: response.data.Poster,
      runtime: response.data.Runtime,
      imdbRating: response.data.imdbRating,
      actors: response.data.Actors,
      director: response.data.Director,
    };

    const insertedMovie = await db
      .insert(moviesTable)
      .values(movieData)
      .returning();

    return insertedMovie[0];
  }

  async getAllByUserId(userId: number): Promise<SelectMovieWithRating[]> {
    const ratedMovies = await db
      .select()
      .from(moviesTable)
      .innerJoin(ratingsTable, eq(moviesTable.id, ratingsTable.movieId))
      .where(eq(ratingsTable.userId, userId));

    return ratedMovies.map((row) => ({
      ...row.movies,
      ratingId: row.ratings.id,
      stars: row.ratings.stars,
    }));
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../src/movies/movies.service';
import { db } from '../src/db/db';
import axios from 'axios';

jest.mock('axios');

jest.mock('../src/db/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockResolvedValue(mockMovies),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(mockMovies);
    });
  });

  describe('findByImdbID', () => {
    it('should return movie by imdbID', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', imdbID: 'tt1234567' };
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockMovie]),
        }),
      } as any);

      const result = await service.findByImdbID('tt1234567');
      expect(result).toEqual(mockMovie);
    });
  });

  describe('createFromOmdb', () => {
    it('should create a movie from OMDB', async () => {
      const mockMovieData = {
        Title: 'Movie 1',
        Year: '2020',
        Plot: 'A great movie',
        Genre: 'Action',
        imdbID: 'tt1234567',
        Type: 'movie',
        Poster: 'http://example.com/poster.jpg',
        Runtime: '120 min',
        imdbRating: '8.5',
        Actors: 'Actor 1, Actor 2',
        Director: 'Director 1',
      };
      const mockResponse = { data: mockMovieData };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const mockInsertedMovie = { id: 1, ...mockMovieData };
      jest.spyOn(db, 'insert').mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedMovie]),
        }),
      } as any);

      const result = await service.createFromOmdb('tt1234567');
      expect(result).toEqual(mockInsertedMovie);
    });
  });

  describe('getAllByUserId', () => {
    it('should get all movies rated by a user', async () => {
      const mockMovies = [
        { movies: { id: 1, title: 'Movie 1' }, ratings: { id: 1, stars: 4 } },
        { movies: { id: 2, title: 'Movie 2' }, ratings: { id: 2, stars: 5 } },
      ];
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockMovies),
          }),
        }),
      } as any);

      const result = await service.getAllByUserId(1);
      expect(result).toEqual(
        mockMovies.map((row) => ({
          ...row.movies,
          ratingId: row.ratings.id,
          stars: row.ratings.stars,
        })),
      );
    });
  });
});

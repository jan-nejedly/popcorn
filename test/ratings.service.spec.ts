import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../src/ratings/ratings.service';
import { db } from '../src/db/db';
import { ratingsTable, usersTable, followersTable, moviesTable } from '../src/db/schema';
import { and, eq, sql, count } from 'drizzle-orm';

// Mock the db object
jest.mock('../src/db/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  }
}));

describe('RatingsService', () => {
    let service: RatingsService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RatingsService],
      }).compile();
  
      service = module.get<RatingsService>(RatingsService);
    
      jest.clearAllMocks();
    });
  
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  
    // Test for adding rating
    describe('addRating', () => {
        it('should add a new rating if it does not exist', async () => {
            const userId = 1;
            const movieId = 1;
            const stars = 5;

            const valuesSpy = jest.fn().mockResolvedValue([]);
            jest.spyOn(service, 'checkIfRatingExists').mockResolvedValue(false);
            const insertSpy = jest.spyOn(db, 'insert').mockReturnValue({
                values: valuesSpy,
            } as any);

            await service.addRating(userId, movieId, stars);

            expect(service.checkIfRatingExists).toHaveBeenCalledWith(userId, movieId);
            expect(insertSpy).toHaveBeenCalledWith(ratingsTable);
            expect(valuesSpy).toHaveBeenCalledWith({userId, movieId, stars});
        });

        it('should not add a new rating if it exists', async () => {
            const userId = 1;
            const movieId = 1;
            const stars = 5;
    
            jest.spyOn(service, 'checkIfRatingExists').mockResolvedValue(true);
            const insertSpy = jest.spyOn(db, 'insert').mockReturnValue({
            values: jest.fn(),
            } as any);
    
            const result = await service.addRating(userId, movieId, stars);
    
            expect(service.checkIfRatingExists).toHaveBeenCalledWith(userId, movieId);
            expect(insertSpy).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    // Test of existing rating
    describe('checkIfRatingExists', () => {
        it('should return true if the rating exists', async () => {
            const userId = 1;
            const movieId = 1;
        
            jest.spyOn(db, 'select').mockReturnValue({
                from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([{}]),
                }),
                }),
            } as any);
            
            const result = await service.checkIfRatingExists(userId, movieId);
        
            expect(result).toBe(true);
        });
    
        it('should return false if the rating does not exist', async () => {
            const userId = 1;
            const movieId = 1;
    
            jest.spyOn(db, 'select').mockReturnValue({
                from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([]),
                }),
                }),
            } as any);
        
            const result = await service.checkIfRatingExists(userId, movieId);
        
            expect(result).toBe(false);
        });
    });
});

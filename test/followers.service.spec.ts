import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from '../src/followers/followers.service';
import { db } from 'src/db/db';
import { followersTable } from 'src/db/schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { eq, and } from 'drizzle-orm';

// Mock the db object
jest.mock('../src/db/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../src/notifications/notifications.service');

describe('FollowersService', () => {
  let service: FollowersService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowersService, NotificationsService],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for isFollowing
  describe('isFollowing', () => {
    it('should return true if following', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([{ id: 1 }]),
        }),
      } as any);

      const result = await service.isFollowing(1, 2);
      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const result = await service.isFollowing(1, 2);
      expect(result).toBe(false);
    });
  });

  // Test for addFollowing
  describe('addFollowing', () => {
    it('should add following and notify', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const valuesSpy = jest.fn().mockResolvedValue(null);
      const insertSpy = jest.spyOn(db, 'insert').mockReturnValue({
        values: valuesSpy,
      } as any);

      const notifySpy = jest.spyOn(notificationsService, 'notifyFollowers');

      const result = await service.addFollowing(1, 2, 'currentUser');
      expect(result).toBe(true);
      expect(insertSpy).toHaveBeenCalledWith(followersTable);
      expect(valuesSpy).toHaveBeenCalledWith({ userId: 1, followerId: 2 });
      expect(notifySpy).toHaveBeenCalledWith('currentUser', 2);
    });

    it('should return false if already following', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([{ id: 1 }]),
        }),
      } as any);

      const result = await service.addFollowing(1, 2, 'currentUser');
      expect(result).toBe(false);
    });
  });

  // Test for removeFollowing
  describe('removeFollowing', () => {
    it('should remove following', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([{ id: 1 }]),
        }),
      } as any);

      const valuesSpy = jest.fn().mockResolvedValue(null);
      const deleteSpy = jest.spyOn(db, 'delete').mockReturnValue({
        where: valuesSpy,
      } as any);

      const result = await service.removeFollowing(1, 2);
      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith(followersTable);
      expect(valuesSpy).toHaveBeenCalledWith(
        and(eq(followersTable.userId, 1), eq(followersTable.followerId, 2)),
      );
    });

    it('should return true if not following', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const result = await service.removeFollowing(1, 2);
      expect(result).toBe(true);
    });
  });

  // Test for deleteFollowingById
  describe('deleteFollowingById', () => {
    it('should delete following by id if exists', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([{ id: 1 }]),
        }),
      } as any);

      const valuesSpy = jest.fn().mockResolvedValue(null);
      const deleteSpy = jest.spyOn(db, 'delete').mockReturnValue({
        where: valuesSpy,
      } as any);

      const result = await service.deleteFollowingById(1);
      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith(followersTable);
      expect(valuesSpy).toHaveBeenCalledWith(eq(followersTable.id, 1));
    });

    it('should return false if following does not exist', async () => {
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const result = await service.deleteFollowingById(1);
      expect(result).toBe(false);
    });
  });

  describe('getAllByUserId', () => {
    it('should get all followers with stats by user id', async () => {
      const mockFollowers = [
        {
          id: 1,
          name: 'John Doe',
          totalRuntime: 120,
          movieCount: 10,
          averageStars: 4.5,
        },
      ];
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValueOnce(mockFollowers),
              }),
            }),
          }),
        }),
      } as any);

      const result = await service.getAllByUserId(1);
      expect(result).toEqual(mockFollowers);
    });
  });

  // Test for getTotalStatsByUserId
  describe('getTotalStatsByUserId', () => {
    it('should get total stats by user id', async () => {
      const mockStats = {
        totalRuntime: 120,
        movieCount: 10,
        averageStars: 4.5,
        followersCount: 5,
      };
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValueOnce([mockStats]),
            }),
          }),
        }),
      } as any);

      const result = await service.getTotalStatsByUserId(1);
      expect(result).toEqual(mockStats);
    });
  });
});

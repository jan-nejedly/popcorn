import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { followersTable } from 'src/db/schema';

@Injectable()
export class FollowersService {
  async deleteFollowingById(followingId: number): Promise<boolean> {
    const followingExists = await db
      .select()
      .from(followersTable)
      .where(eq(followersTable.id, followingId));

    if (followingExists.length > 0) {
      await db.delete(followersTable).where(eq(followersTable.id, followingId));
      return true;
    } else {
      return false;
    }
  }
}

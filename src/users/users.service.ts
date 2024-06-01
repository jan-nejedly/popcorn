import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/db';
import { usersTable, SelectUser } from '../db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  async findAll(): Promise<SelectUser[]> {
    return db.select(getTableColumns(usersTable)).from(usersTable);
  }

  async findByEmail(email: string): Promise<SelectUser | void> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

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

  async register(email: string, password: string) {
    const emailTaken = await this.findByEmail(email);
    if (emailTaken) {
      throw new BadRequestException('Email already taken');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    const user = await db
      .insert(usersTable)
      .values({ email, password: hashedPassword })
      .returning();

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }
}

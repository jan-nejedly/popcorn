import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let mockResponse;

  beforeEach(async () => {
    fakeUsersService = {
      findAll: () =>
        Promise.resolve([{ id: 1, name: 'john', password: 'hashedpassword' }]),
      findByName: (name: string) => {
        if (name === 'john')
          return Promise.resolve({
            id: 1,
            name: 'john',
            password: 'hashedpassword',
          });
        return Promise.resolve(null);
      },
      findById: (id: number) => {
        if (id === 1)
          return Promise.resolve({
            id: 1,
            name: 'john',
            password: 'hashedpassword',
          });
        return Promise.resolve(null);
      },
      searchByName: (query: string, curUserId: number) => {
        if (query.includes('john') && curUserId !== 1)
          return Promise.resolve([{ id: 1, name: 'john' }]);
        return Promise.resolve([]);
      },
      register: (name: string, password: string, passwordConfirm: string) => {
        if (name === 'takenName')
          throw new BadRequestException('Name already taken');
        if (password.length < 6)
          throw new BadRequestException('Password too short');
        if (password !== passwordConfirm)
          throw new BadRequestException('Passwords not matching');
        return Promise.resolve({ id: 2, name, password: 'hashedpassword' });
      },
      login: (name: string, password: string) => {
        if (name !== 'john') throw new NotFoundException('User not found');
        if (password !== 'password')
          throw new BadRequestException('Invalid password');
        return Promise.resolve({
          id: 1,
          name: 'john',
          password: 'hashedpassword',
        });
      },
    };

    mockResponse = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: fakeUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login updates session and redirects to movies', async () => {
    const session = { user: null };

    await controller.login('john', 'password', session, mockResponse);

    expect(session.user).toEqual({ id: 1, name: 'john' });
    expect(mockResponse.redirect).toHaveBeenCalledWith('/movies');
  });

  it('login redirects to login page with error on failure', async () => {
    const session = {};

    await controller.login('jane', 'password', session, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      '/users/login?error=Invalid credentials',
    );
  });

  it('register redirects to movies on success', async () => {
    const session = { user: null };

    await controller.register(
      'john',
      'password',
      'password',
      session,
      mockResponse,
    );

    expect(session.user).toEqual({ id: 2, name: 'john' });
    expect(mockResponse.redirect).toHaveBeenCalledWith('/movies');
  });

  it('register redirects to register page with error if name is taken', async () => {
    const session = {};

    await controller.register(
      'takenName',
      'password',
      'password',
      session,
      mockResponse,
    );

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      '/users/register?error=Name already taken',
    );
  });

  it('search returns a list of users', async () => {
    const result = await controller.search('john', { id: 2 });

    expect(result).toEqual([{ id: 1, name: 'john' }]);
  });

  it('search does not return current user', async () => {
    const result = await controller.search('john', { id: 1 });

    expect(result).toEqual([]);
  });

  it('logout clears the session and redirects', async () => {
    const session = { user: { id: 1 } };

    await controller.logout(session, mockResponse);

    expect(session.user).toBeNull();
    expect(mockResponse.redirect).toHaveBeenCalledWith('/users/login');
  });

  it('whoAmI returns the current user', async () => {
    const result = await controller.whoAmI({ id: 1 });

    expect(result).toEqual({ id: 1, name: 'john', password: 'hashedpassword' });
  });
});

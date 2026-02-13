import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMethod } from '@prisma/client';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  async findByEmail(email: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  async create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: password ? await hash(password) : '',
        displayName,
        picture,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        method,
        isVerified,
      },
      include: {
        accounts: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}

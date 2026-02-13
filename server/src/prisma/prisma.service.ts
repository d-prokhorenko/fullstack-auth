import {
  Global,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$disconnect();
  }
}

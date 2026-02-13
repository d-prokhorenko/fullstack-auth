import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import session from 'express-session';
import { ms, StringValue } from './libs/common/utils/ms-util';
import { parseBoolean } from './libs/common/utils/parse-boolean.util';
import { createClient } from 'redis';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { RedisStore } from 'connect-redis';

dotenvExpand.expand(dotenv.config());

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  });

  await redisClient.connect();

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis connected ✅'));
  redisClient.on('ready', () => console.log('Redis ready ✅'));

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redisClient,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
bootstrap();

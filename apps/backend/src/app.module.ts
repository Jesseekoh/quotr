import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { betterAuth } from 'better-auth';
import { LoggerModule } from 'nestjs-pino';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { ProductsModule } from './products/products.module.js';
import { QuotesModule } from './quotes/quotes.module.js';
import { CustomersModule } from './customers/customers.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRootAsync({
      inject: [PrismaService, ConfigService],
      useFactory: async (prisma: PrismaService, config: ConfigService) => ({
        auth: betterAuth({
          database: prismaAdapter(prisma, {
            provider: 'postgresql',
          }),
          emailAndPassword: { enabled: true },
          secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
          baseURL: config.getOrThrow<string>('BETTER_AUTH_URL'),
          trustedOrigins: [config.getOrThrow<string>('ORIGIN')!],
          advanced: {
            // disableOriginCheck: config.get('NODE_ENV') !== 'production',
            database: {
              joins: true,
            },
            defaultCookieAttributes: {
              sameSite: 'lax',
              secure: config.get('NODE_ENV') === 'production',
            },
          },
        }),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    PrismaModule,
    ProductsModule,
    QuotesModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

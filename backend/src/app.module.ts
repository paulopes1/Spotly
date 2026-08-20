import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PropertiesModule } from './properties/properties.module';
import { ScoringModule } from './scoring/scoring.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limit global: 60 req/min por IP. A rota de busca (que chama a
    // OpenAI e custa dinheiro) tem um limite mais rígido via @Throttle no
    // controller.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    DatabaseModule,
    PropertiesModule,
    AiModule,
    ScoringModule,
    SearchModule,
    AuthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

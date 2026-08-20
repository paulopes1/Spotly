import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // synchronize cria/atualiza as tabelas a partir das entities — ótimo
        // para MVP/desenvolvimento. Em produção, trocar por migrations
        // (typeorm migration:generate) e desligar isto.
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}

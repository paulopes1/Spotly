import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { Search } from '../database/entities/search.entity';
import { SearchResult } from '../database/entities/search-result.entity';
import { PropertiesModule } from '../properties/properties.module';
import { ScoringModule } from '../scoring/scoring.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Search, SearchResult]),
    AiModule,
    ScoringModule,
    PropertiesModule,
    AuthModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

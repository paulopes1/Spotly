import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Property } from '../database/entities/property.entity';
import { SavedProperty } from '../database/entities/saved-property.entity';
import { Search } from '../database/entities/search.entity';
import { SearchResult } from '../database/entities/search-result.entity';
import { User } from '../database/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Search, SearchResult, SavedProperty, Property]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

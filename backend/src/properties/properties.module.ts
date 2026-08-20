import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../database/entities/property.entity';
import { DbPropertiesRepository, PropertiesRepository } from './properties.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  providers: [{ provide: PropertiesRepository, useClass: DbPropertiesRepository }],
  exports: [PropertiesRepository],
})
export class PropertiesModule {}

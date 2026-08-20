import { Module } from '@nestjs/common';
import { AppreciationController } from './appreciation.controller';
import { AppreciationService } from './appreciation.service';

@Module({
  controllers: [AppreciationController],
  providers: [AppreciationService],
})
export class AppreciationModule {}

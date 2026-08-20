import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}

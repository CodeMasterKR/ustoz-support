import { Controller, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.users.getProfile(req.user.userId);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() body: { name?: string; avatar?: string }) {
    return this.users.updateProfile(req.user.userId, body);
  }

  @Delete('me')
  deleteAccount(@Request() req) {
    return this.users.deleteAccount(req.user.userId);
  }
}

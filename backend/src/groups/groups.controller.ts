import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  findAll(@Request() req) { return this.groups.findAll(req.user.userId); }

  @Post()
  create(@Request() req, @Body() body: { name: string }) {
    return this.groups.create(req.user.userId, body);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: { name: string }) {
    return this.groups.update(id, req.user.userId, body);
  }

  @Delete('clear')
  clear(@Request() req) {
    return this.groups.clear(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.groups.remove(id, req.user.userId);
  }
}

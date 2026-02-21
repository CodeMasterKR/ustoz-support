import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private history: HistoryService) {}

  @Get()
  findAll(@Request() req) {
    return this.history.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body: { topic: string; language: string; types: string[]; result: any }) {
    return this.history.create(req.user.userId, body);
  }

  @Delete('clear')
  clear(@Request() req) {
    return this.history.clear(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.history.remove(id, req.user.userId);
  }
}

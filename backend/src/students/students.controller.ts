import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private students: StudentsService) {}

  @Get()
  findAll(@Request() req) { return this.students.findAll(req.user.userId); }

  @Post()
  create(@Request() req, @Body() body: { name: string; groupId?: string }) {
    return this.students.create(req.user.userId, body);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: { name?: string; groupId?: string | null }) {
    return this.students.update(id, req.user.userId, body);
  }

  @Delete('clear')
  clear(@Request() req) {
    return this.students.clear(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.students.remove(id, req.user.userId);
  }
}

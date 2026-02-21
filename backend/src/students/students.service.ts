import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.student.findMany({ where: { userId }, include: { group: true }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, data: { name: string; groupId?: string }) {
    return this.prisma.student.create({ data: { ...data, userId }, include: { group: true } });
  }

  update(id: string, userId: string, data: { name?: string; groupId?: string }) {
    return this.prisma.student.updateMany({ where: { id, userId }, data });
  }

  remove(id: string, userId: string) {
    return this.prisma.student.deleteMany({ where: { id, userId } });
  }
}

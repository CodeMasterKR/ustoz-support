import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: { topic: string; language: string; types: string[]; result: any }) {
    return this.prisma.history.create({
      data: { ...data, userId },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.history.deleteMany({ where: { id, userId } });
  }

  async clear(userId: string) {
    return this.prisma.history.deleteMany({ where: { userId } });
  }
}

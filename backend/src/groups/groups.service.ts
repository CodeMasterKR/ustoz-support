import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.group.findMany({ where: { userId }, include: { students: true }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, data: { name: string }) {
    return this.prisma.group.create({ data: { ...data, userId }, include: { students: true } });
  }

  update(id: string, userId: string, data: { name: string }) {
    return this.prisma.group.updateMany({ where: { id, userId }, data });
  }

  remove(id: string, userId: string) {
    return this.prisma.group.deleteMany({ where: { id, userId } });
  }
}

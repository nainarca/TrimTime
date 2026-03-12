import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileInput } from './dto/update-profile.input';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      include: { roles: true },
    });
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    await this.findById(userId); // ensure exists
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      include: { roles: true },
    });
  }

  async deactivate(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
}

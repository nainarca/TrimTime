import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShopInput, UpdateShopInput } from './dto/create-shop.input';
import { generateSlug } from '@trimtime/shared-utils';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Owner: create shop ────────────────────────────────────────────────────

  async createShop(ownerId: string, input: CreateShopInput) {
    // One shop per owner (can be expanded later)
    const existing = await this.prisma.shop.findFirst({ where: { ownerId } });
    if (existing) {
      throw new ConflictException('You already have a shop. Use multi-branch instead.');
    }

    const slug = await this.generateUniqueSlug(input.name);

    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          owner: { connect: { id: ownerId } },
          name: input.name,
          slug,
          phone: input.phone ?? '0000000000',
          description: input.description,
          country: input.country,
          timezone: input.timezone,
          currency: input.currency,
          branches: {
            create: {
              name: 'Main Branch',
              address: '',
              city: '',
              phone: '',
              isMain: true,
            },
          },
        },
      });

      // Assign SHOP_OWNER role
      await tx.userRoleAssignment.upsert({
        where: { unique_user_role_shop: { userId: ownerId, role: 'SHOP_OWNER', shopId: shop.id } },
        create: { userId: ownerId, role: 'SHOP_OWNER', shopId: shop.id },
        update: {},
      });

      return shop;
    });
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findById(id: string, allowedShopIds?: string[]) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException(`Shop ${id} not found`);
    if (allowedShopIds && !allowedShopIds.includes(shop.id)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return shop;
  }

  async findBySlug(slug: string, allowedShopIds?: string[]) {
    const shop = await this.prisma.shop.findUnique({ where: { slug } });
    if (!shop) throw new NotFoundException(`Shop with slug "${slug}" not found`);
    if (allowedShopIds && !allowedShopIds.includes(shop.id)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return shop;
  }

  async findByOwner(ownerId: string, allowedShopIds?: string[]) {
    const shop = await this.prisma.shop.findFirst({ where: { ownerId, isActive: true } });
    if (shop && allowedShopIds && !allowedShopIds.includes(shop.id)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return shop;
  }

  async getBranches(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return this.prisma.shopBranch.findMany({
      where: { shopId, isActive: true },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getBranchesBySlug(slug: string) {
    const shop = await this.findBySlug(slug);
    return this.getBranches(shop.id);
  }

  // ── Owner: update shop ────────────────────────────────────────────────────

  async updateShop(shopId: string, ownerId: string, input: UpdateShopInput) {
    await this.assertOwner(shopId, ownerId);
    return this.prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.coverUrl !== undefined && { coverUrl: input.coverUrl }),
      },
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async assertOwner(shopId: string, userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });
    if (!shop) throw new NotFoundException(`Shop ${shopId} not found`);
    if (shop.ownerId !== userId) throw new ForbiddenException('Not your shop');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let suffix = 0;
    while (await this.prisma.shop.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${generateSlug(name)}-${suffix}`;
    }
    return slug;
  }
}

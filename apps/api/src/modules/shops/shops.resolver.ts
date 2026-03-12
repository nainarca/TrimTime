import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ShopsService } from './shops.service';
import { ShopModel, BranchModel } from './models/shop.model';
import { CreateShopInput, UpdateShopInput } from './dto/create-shop.input';
import { GqlJwtGuard } from '../auth/guards/gql-jwt.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => ShopModel)
export class ShopsResolver {
  constructor(private readonly shopsService: ShopsService) {}

  @Query(() => ShopModel, {
    nullable: true,
    description: 'Get shop by URL slug (public — for QR scan landing)',
  })
  shopBySlug(@Args('slug') slug: string): Promise<ShopModel> {
    return this.shopsService.findBySlug(slug) as unknown as Promise<ShopModel>;
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => ShopModel, {
    nullable: true,
    description: "Get authenticated owner's shop",
  })
  myShop(@CurrentUser() user: AuthenticatedUser): Promise<ShopModel | null> {
    return this.shopsService.findByOwner(user.id, user.shopIds) as unknown as Promise<ShopModel | null>;
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => [BranchModel], { description: 'List branches for a shop' })
  shopBranches(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BranchModel[]> {
    // service already filters by shopId; guard ensures permission
    return this.shopsService.getBranches(shopId, user.shopIds) as unknown as Promise<BranchModel[]>;
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => ShopModel, { description: 'Create a new shop (owner only)' })
  createShop(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateShopInput,
  ): Promise<ShopModel> {
    return this.shopsService.createShop(user.id, input) as unknown as Promise<ShopModel>;
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => ShopModel, { description: 'Update shop details (owner only)' })
  updateShop(
    @CurrentUser() user: AuthenticatedUser,
    @Args('shopId', { type: () => ID }) shopId: string,
    @Args('input') input: UpdateShopInput,
  ): Promise<ShopModel> {
    return this.shopsService.updateShop(shopId, user.id, input) as unknown as Promise<ShopModel>;
  }
}

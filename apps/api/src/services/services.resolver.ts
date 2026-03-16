import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceModel } from './models/service.model';
import { ServiceInput } from './dto/service.input';
import { GqlJwtGuard } from '../modules/auth/guards/gql-jwt.guard';
import { TenantGuard } from '../modules/auth/guards/tenant.guard';
import { CurrentUser, AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';

@Resolver(() => ServiceModel)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => [ServiceModel], { description: 'Get services for a shop' })
  services(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.servicesService.listServices(shopId, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => ServiceModel, { description: 'Create or update a service' })
  upsertService(
    @Args('input') input: ServiceInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.servicesService.upsertService(input, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => Boolean, { description: 'Delete a service' })
  deleteService(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.servicesService.deleteService(id, user.shopIds);
  }
}

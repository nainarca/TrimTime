import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { BarberModel } from './models/barber.model';
import { BarberInput } from './dto/barber.input';
import { GqlJwtGuard } from '../modules/auth/guards/gql-jwt.guard';
import { TenantGuard } from '../modules/auth/guards/tenant.guard';
import { CurrentUser, AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';

@Resolver(() => BarberModel)
export class BarbersResolver {
  constructor(private readonly barbersService: BarbersService) {}

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => [BarberModel], { description: 'List barbers for a shop' })
  barbers(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.barbersService.listBarbers(shopId, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => BarberModel, { description: 'Create or update barber' })
  upsertBarber(
    @Args('input') input: BarberInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.barbersService.upsertBarber(input, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => Boolean, { description: 'Delete a barber' })
  deleteBarber(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.barbersService.deleteBarber(id, user.shopIds);
  }
}

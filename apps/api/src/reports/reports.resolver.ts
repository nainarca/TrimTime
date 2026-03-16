import { Resolver, Query, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ServiceUsage } from './dto/reports.dto';
import { QueueStatsModel } from '@trimtime/shared-types';
import { GqlJwtGuard } from '../modules/auth/guards/gql-jwt.guard';
import { TenantGuard } from '../modules/auth/guards/tenant.guard';
import { CurrentUser, AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => QueueStatsModel, { description: 'Get daily queue stats for a shop' })
  dailyQueueStats(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.dailyQueueStats(shopId, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => Float, { description: 'Get average wait time for a shop' })
  averageWaitTime(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.averageWaitTime(shopId, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => [ServiceUsage], { description: 'Get service usage counts for a shop' })
  servicesUsage(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.servicesUsage(shopId, user.shopIds);
  }
}

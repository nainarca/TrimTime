import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentModel } from './models/appointment.model';
import { AppointmentInput } from './dto/appointment.input';
import { GqlJwtGuard } from '../modules/auth/guards/gql-jwt.guard';
import { TenantGuard } from '../modules/auth/guards/tenant.guard';
import { CurrentUser, AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';

@Resolver(() => AppointmentModel)
export class AppointmentsResolver {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => AppointmentModel, { description: 'Create a new appointment' })
  createAppointment(
    @Args('input') input: AppointmentInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appointmentsService.createAppointment(input, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Mutation(() => Boolean, { description: 'Cancel an appointment' })
  cancelAppointment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appointmentsService.cancelAppointment(id, user.shopIds);
  }

  @UseGuards(GqlJwtGuard, TenantGuard)
  @Query(() => [AppointmentModel], { description: 'List appointments for a shop' })
  appointmentsByShop(
    @Args('shopId', { type: () => ID }) shopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appointmentsService.appointmentsByShop(shopId, user.shopIds);
  }
}

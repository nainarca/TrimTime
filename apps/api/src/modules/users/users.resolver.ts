import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlJwtGuard } from '../auth/guards/gql-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlJwtGuard)
  @Query(() => UserModel, { description: 'Get authenticated user profile' })
  me(@CurrentUser() user: User): Promise<UserModel> {
    return this.usersService.findById(user.id) as unknown as Promise<UserModel>;
  }

  @UseGuards(GqlJwtGuard)
  @Mutation(() => UserModel, { description: 'Update own profile details' })
  updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserModel> {
    return this.usersService.updateProfile(user.id, input) as unknown as Promise<UserModel>;
  }
}

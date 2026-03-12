import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@trimtime/shared-types';

// Register enum once (shared across all resolvers)
registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class RoleAssignment {
  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String, { nullable: true })
  shopId: string | null;
}

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  phone: string;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field()
  isVerified: boolean;

  @Field()
  isActive: boolean;

  @Field(() => [RoleAssignment])
  roles: RoleAssignment[];

  @Field()
  createdAt: Date;
}

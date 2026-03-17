import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  @MinLength(4)
  password: string;

  @Field({ nullable: true })
  @IsString()
  role?: string;
}

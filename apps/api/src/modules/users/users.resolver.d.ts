import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { UpdateProfileInput } from './dto/update-profile.input';
import { User } from '@prisma/client';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: User): Promise<UserModel>;
    updateProfile(user: User, input: UpdateProfileInput): Promise<UserModel>;
}

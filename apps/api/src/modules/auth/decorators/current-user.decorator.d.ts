import { User } from '@prisma/client';
export interface AuthenticatedUser extends User {
    shopIds?: string[];
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;

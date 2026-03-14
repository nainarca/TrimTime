import { ExecutionContext } from '@nestjs/common';
declare const GqlJwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * JWT guard that works for both HTTP and GraphQL contexts.
 * Extracts the request from the GraphQL execution context.
 */
export declare class GqlJwtGuard extends GqlJwtGuard_base {
    getRequest(context: ExecutionContext): Request;
}
export {};

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JWT guard that works for both HTTP and GraphQL contexts.
 * Extracts the request from the GraphQL execution context.
 */
@Injectable()
export class GqlJwtGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{ req: Request }>().req;
  }
}

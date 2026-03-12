import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: any }>();
    const user = req.user;

    if (!user) {
      // will be caught by auth guard earlier
      return false;
    }

    // extract shopId from args or input
    const args = ctx.getArgs();
    let shopId: string | undefined;

    if (typeof args.shopId === 'string') {
      shopId = args.shopId;
    } else if (args.input && typeof args.input.shopId === 'string') {
      shopId = args.input.shopId;
    } else if (args.input && args.input.shop && typeof args.input.shop.shopId === 'string') {
      shopId = args.input.shop.shopId;
    }

    if (shopId) {
      const allowed: string[] = user.shopIds ?? [];
      if (!allowed.includes(shopId)) {
        throw new ForbiddenException('Access to this shop is not permitted');
      }
    }

    return true;
  }
}

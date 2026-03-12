import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsResolver } from './shops.resolver';

@Module({
  providers: [ShopsService, ShopsResolver],
  exports: [ShopsService],
})
export class ShopsModule {}

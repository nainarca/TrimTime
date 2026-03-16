import { Module } from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { BarbersResolver } from './barbers.resolver';

@Module({
  providers: [BarbersService, BarbersResolver],
  exports: [BarbersService],
})
export class BarbersModule {}

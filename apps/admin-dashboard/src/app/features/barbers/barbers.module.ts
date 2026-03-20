import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BarbersRoutingModule } from './barbers-routing.module';
import { BarbersPageComponent } from './pages/barbers/barbers.page';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  imports: [
    SharedModule,
    BarbersRoutingModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
  ],
  declarations: [BarbersPageComponent],
})
export class BarbersModule {}

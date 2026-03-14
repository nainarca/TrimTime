import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsPageComponent } from './pages/reports/reports.page';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule,
    ChartModule,
    TableModule,
    CalendarModule,
    ButtonModule,
  ],
  declarations: [ReportsPageComponent],
})
export class ReportsModule {}


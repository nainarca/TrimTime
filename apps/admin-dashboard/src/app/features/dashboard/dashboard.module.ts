import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardHomePageComponent } from './pages/dashboard-home/dashboard-home.page';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@NgModule({
  imports: [SharedModule, DashboardRoutingModule, CardModule, ChartModule],
  declarations: [DashboardHomePageComponent],
})
export class DashboardModule {}


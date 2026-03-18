import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardHomePageComponent } from './pages/dashboard-home/dashboard-home.page';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    DashboardRoutingModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
  ],
  declarations: [DashboardHomePageComponent],
})
export class DashboardModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomePageComponent } from './pages/dashboard-home/dashboard-home.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardHomePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketingPageComponent } from './pages/marketing/marketing.page';

const routes: Routes = [
  {
    path: '',
    component: MarketingPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketingRoutingModule {}


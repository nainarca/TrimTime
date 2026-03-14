import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancePageComponent } from './pages/finance/finance.page';

const routes: Routes = [
  {
    path: '',
    component: FinancePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}


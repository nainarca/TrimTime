import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarbersPageComponent } from './pages/barbers/barbers.page';

const routes: Routes = [{ path: '', component: BarbersPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarbersRoutingModule {}

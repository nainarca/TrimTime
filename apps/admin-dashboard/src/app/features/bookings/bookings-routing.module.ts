import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingsPageComponent } from './pages/bookings/bookings.page';

const routes: Routes = [
  {
    path: '',
    component: BookingsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsRoutingModule {}


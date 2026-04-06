import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingsPageComponent } from './pages/bookings/bookings.page';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  imports: [
    SharedModule,
    BookingsRoutingModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    TooltipModule,
  ],
  declarations: [BookingsPageComponent],
})
export class BookingsModule {}


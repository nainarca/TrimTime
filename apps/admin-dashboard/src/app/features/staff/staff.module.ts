import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StaffRoutingModule } from './staff-routing.module';
import { StaffPageComponent } from './pages/staff/staff.page';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    SharedModule,
    StaffRoutingModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
  ],
  declarations: [StaffPageComponent],
})
export class StaffModule {}


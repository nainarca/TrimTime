import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersPageComponent } from './pages/customers/customers.page';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [SharedModule, CustomersRoutingModule, TableModule, DialogModule, ButtonModule],
  declarations: [CustomersPageComponent],
})
export class CustomersModule {}


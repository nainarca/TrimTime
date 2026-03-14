import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ServicesRoutingModule } from './services-routing.module';
import { ServicesPageComponent } from './pages/services/services.page';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    SharedModule,
    ServicesRoutingModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
  ],
  declarations: [ServicesPageComponent],
})
export class ServicesModule {}


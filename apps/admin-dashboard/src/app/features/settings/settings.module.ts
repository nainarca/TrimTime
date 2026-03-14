import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsPageComponent } from './pages/settings/settings.page';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    SharedModule,
    SettingsRoutingModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
  ],
  declarations: [SettingsPageComponent],
})
export class SettingsModule {}


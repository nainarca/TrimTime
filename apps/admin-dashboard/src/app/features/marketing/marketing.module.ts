import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MarketingRoutingModule } from './marketing-routing.module';
import { MarketingPageComponent } from './pages/marketing/marketing.page';

@NgModule({
  imports: [SharedModule, MarketingRoutingModule],
  declarations: [MarketingPageComponent],
})
export class MarketingModule {}


import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { QueueRoutingModule } from './queue-routing.module';
import { QueueListPageComponent } from './pages/queue-list/queue-list.page';
import { LiveQueuePageComponent } from './pages/live-queue/live-queue.page';
import { QueueDetailsPageComponent } from './pages/queue-details/queue-details.page';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

@NgModule({
  imports: [
    SharedModule,
    QueueRoutingModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
  ],
  declarations: [QueueListPageComponent, LiveQueuePageComponent, QueueDetailsPageComponent],
})
export class QueueModule {}


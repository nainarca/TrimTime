import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueueListPageComponent } from './pages/queue-list/queue-list.page';
import { LiveQueuePageComponent } from './pages/live-queue/live-queue.page';
import { QueueDetailsPageComponent } from './pages/queue-details/queue-details.page';

const routes: Routes = [
  {
    path: '',
    component: QueueListPageComponent,
  },
  {
    path: 'live',
    component: LiveQueuePageComponent,
  },
  {
    path: ':id',
    component: QueueDetailsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueueRoutingModule {}


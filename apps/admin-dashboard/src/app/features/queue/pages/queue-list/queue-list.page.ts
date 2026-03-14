import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-queue-list-page',
  templateUrl: './queue-list.page.html',
  styleUrls: ['./queue-list.page.scss'],
})
export class QueueListPageComponent implements OnInit, OnDestroy {
  shopId: string | null = null;
  barberId: string | null = null;

  entries: QueueEntry[] = [];
  stats: any;
  loading = false;

  private sub?: Subscription;

  constructor(
    private readonly queueService: QueueService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadData();
    this.sub = this.queueService
      .queueUpdated$(this.shopId, this.barberId)
      .subscribe((evt) => {
        this.entries = evt.activeEntries;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadData(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.queueService.getActiveQueue(this.shopId, this.barberId).subscribe((entries) => {
      this.entries = entries;
      this.loading = false;
    });
    this.queueService.getQueueStats(this.shopId, this.barberId).subscribe((stats) => {
      this.stats = stats;
    });
  }
}


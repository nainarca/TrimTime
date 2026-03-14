import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-queue-details-page',
  templateUrl: './queue-details.page.html',
  styleUrls: ['./queue-details.page.scss'],
})
export class QueueDetailsPageComponent implements OnInit {
  entryId!: string;
  shopId: string | null = null;
  loading = false;
  errorMessage: string | null = null;
  entry?: QueueEntry;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueService: QueueService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    this.entryId = this.route.snapshot.paramMap.get('id') as string;
    if (!this.entryId) {
      void this.router.navigate(['/queue']);
      return;
    }
    this.loadEntry();
  }

  loadEntry(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.errorMessage = null;
    // For now, load from active queue; a dedicated queueEntry query can replace this later.
    this.queueService.getActiveQueue(this.shopId, null).subscribe({
      next: (entries) => {
        this.entry = entries.find((e) => e.id === this.entryId);
        if (!this.entry) {
          this.errorMessage = 'Queue entry not found or no longer active.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load queue details.';
        this.loading = false;
      },
    });
  }

  callNext(): void {
    if (!this.entry) return;
    this.queueService.updateQueueStatus(this.entry.id, 'CALLED').subscribe(() => {
      this.loadEntry();
    });
  }

  skipToken(): void {
    if (!this.entry) return;
    this.queueService.updateQueueStatus(this.entry.id, 'NO_SHOW').subscribe(() => {
      this.loadEntry();
    });
  }

  cancelBooking(): void {
    if (!this.entry) return;
    // Interpret "cancel booking" as cancelling this queue entry (mark as LEFT).
    this.queueService.updateQueueStatus(this.entry.id, 'LEFT').subscribe(() => {
      this.loadEntry();
    });
  }
}


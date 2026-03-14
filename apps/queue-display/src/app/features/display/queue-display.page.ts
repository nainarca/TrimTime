import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { QueueService } from '../../../core/services/queue.service';
import type { QueueEntry } from '../../../../../../libs/shared/src';

@Component({
  standalone: true,
  selector: 'tt-queue-display-page',
  imports: [CommonModule],
  templateUrl: './queue-display.page.html',
  styleUrls: ['./queue-display.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueDisplayPage implements OnInit, OnDestroy {
  shopId!: string;
  branchId: string | null = null;

  current?: QueueEntry;
  next: QueueEntry[] = [];

  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly queueService: QueueService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.paramMap.get('shopId') as string;
    this.branchId = this.route.snapshot.paramMap.get('branchId');

    this.loadQueue();

    this.sub = this.queueService
      .queueUpdated$(this.shopId, null)
      .subscribe((evt) => this.applyQueue(evt.activeEntries));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadQueue(): void {
    this.queueService.getActiveQueue(this.shopId).subscribe((entries) => {
      this.applyQueue(entries);
    });
  }

  private applyQueue(entries: QueueEntry[]): void {
    const sorted = [...entries].sort((a, b) => a.position - b.position);
    this.current = sorted[0];
    this.next = sorted.slice(1, 6);
  }
}


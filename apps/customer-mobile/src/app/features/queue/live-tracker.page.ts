import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { QueueApiService, QueueEntry } from './services/queue-api.service';

@Component({
  standalone: true,
  selector: 'tt-live-tracker-page',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/join-queue"></ion-back-button></ion-buttons>
        <ion-title>Live Tracker</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <ng-container *ngIf="loading"><div class="loading">Loading latest ticket…</div></ng-container>
      <div *ngIf="entry" class="tracker-card">
        <div class="hero">Your queue status</div>
        <div class="ticket">{{ entry.ticketDisplay }}</div>
        <div class="status">{{ entry.status }}</div>
        <div class="row"><span>Position</span><strong>{{ entry.position }}</strong></div>
        <div class="row"><span>Est. Wait</span><strong>{{ entry.estimatedWaitMins ?? '--' }} mins</strong></div>
        <div class="row"><span>Joined</span><strong>{{ entry.joinedAt | date:'shortTime' }}</strong></div>
      </div>
      <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
    </ion-content>
  `,
})
export class LiveTrackerPage implements OnInit, OnDestroy {
  entryId: string | null = null;
  entry?: QueueEntry;
  loading = true;
  error = '';

  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('entryId');
    if (!this.entryId) {
      this.error = 'Invalid queue entry';
      this.loading = false;
      return;
    }

    this.queueApi.getQueueEntry(this.entryId).subscribe({
      next: (entry) => {
        this.entry = entry;
        this.loading = false;
        this.watchUpdates(entry.shopId);
      },
      error: (err) => {
        this.error = err.message || 'Could not load queue entry';
        this.loading = false;
      },
    });
  }

  private watchUpdates(shopId: string): void {
    this.sub = this.queueApi.queueUpdated$(shopId).subscribe({
      next: (evt) => {
        if (evt.entry?.id === this.entryId) {
          this.entry = { ...this.entry!, ...evt.entry };
          if (this.entry.status === 'SERVED') {
            this.router.navigate(['/queue', this.entryId, 'done']);
          }
        }
      },
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}


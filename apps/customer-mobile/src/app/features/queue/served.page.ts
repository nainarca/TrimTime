import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { QueueApiService } from './services/queue-api.service';

@Component({
  standalone: true,
  selector: 'tt-served-page',
  imports: [CommonModule, DatePipe, RouterModule, FormsModule, IonicModule],
  templateUrl: './served.page.html',
  styleUrls: ['./served.page.scss'],
})
export class ServedPage implements OnInit {
  rating    = 0;
  comment   = '';
  submitted = false;
  today     = new Date();

  // ── Populated from query params ──────────────────────────────
  shopName    = 'QueueCut';
  serviceName = '';
  barberName  = '';
  ticketDisplay = '';

  constructor(
    private readonly route:    ActivatedRoute,
    private readonly router:   Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.shopName     = qp.get('shopName')     || 'QueueCut';
    this.serviceName  = qp.get('serviceName')  || '';
    this.barberName   = qp.get('barberName')   || '';
    this.ticketDisplay = qp.get('ticket')      || '';

    // Also try to load the entry if entryId is in the route params
    const entryId = this.route.snapshot.paramMap.get('entryId');
    if (entryId && (!this.shopName || this.shopName === 'QueueCut')) {
      this.queueApi.getQueueEntry(entryId).subscribe({
        next: (entry) => {
          if (!this.ticketDisplay) this.ticketDisplay = entry.ticketDisplay;
        },
        error: () => {},
      });
    }
  }

  setRating(r: number): void {
    this.rating = r;
  }

  submitRating(): void {
    if (this.rating === 0) return;
    // Store locally for now; Phase 2 will POST to the review API
    this.submitted = true;
  }

  goHome(): void {
    this.router.navigate(['/tabs/scan']);
  }
}

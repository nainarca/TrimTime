import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QueueApiService } from './services/queue-api.service';

export interface ServiceOption {
  id: string;
  name: string;
  duration: string;
  price: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'tt-join-queue-page',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './join-queue.page.html',
  styleUrls: ['./join-queue.page.scss'],
})
export class JoinQueuePage implements OnInit {
  shopId: string | null    = null;
  branchId: string | null  = null;
  shopName   = '';
  branchName = '';
  guestName  = '';
  guestPhone = '';
  loading    = false;
  error      = '';

  selectedService?: ServiceOption;

  services: ServiceOption[] = [
    { id: 's1', name: 'Haircut',         duration: '30 min', price: '$25', icon: 'cut-outline'          },
    { id: 's2', name: 'Beard Trim',      duration: '20 min', price: '$15', icon: 'color-filter-outline' },
    { id: 's3', name: 'Haircut + Beard', duration: '45 min', price: '$35', icon: 'sparkles-outline'     },
    { id: 's4', name: 'Hair Wash',       duration: '15 min', price: '$10', icon: 'water-outline'        },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    this.shopId     = this.route.snapshot.queryParamMap.get('shopId');
    this.branchId   = this.route.snapshot.queryParamMap.get('branchId');
    this.shopName   = this.route.snapshot.queryParamMap.get('shopName')   || '';
    this.branchName = this.route.snapshot.queryParamMap.get('branchName') || '';
  }

  selectService(svc: ServiceOption): void {
    this.selectedService = svc;
  }

  get isFormValid(): boolean {
    return !!(
      this.shopId &&
      this.branchId &&
      this.guestName.trim() &&
      this.guestPhone.trim()
    );
  }

  join(): void {
    if (!this.shopId || !this.branchId) {
      this.error = 'Invalid shop or branch. Please scan again.';
      return;
    }
    if (!this.guestName.trim()) {
      this.error = 'Please enter your name.';
      return;
    }
    this.loading = true;
    this.error   = '';

    this.queueApi
      .joinQueue({
        shopId:     this.shopId,
        branchId:   this.branchId,
        entryType:  'WALK_IN',
        priority:   1,
        guestName:  this.guestName.trim(),
        guestPhone: this.guestPhone.trim(),
      })
      .subscribe({
        next: (entry) => {
          this.loading = false;
          this.router.navigate(['/queue', entry.id]);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Could not join queue. Please try again.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/tabs/scan']);
  }
}

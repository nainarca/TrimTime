import { Component, OnInit } from '@angular/core';
import { ServicesService, Service } from '../../../../core/services/services.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-services-page',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPageComponent implements OnInit {
  shopId: string | null = null;
  services: Service[] = [];
  loading = false;

  serviceDialogVisible = false;
  editingService: Service | null = null;
  form = {
    name: '',
    durationMins: 30,
    price: 0,
  };

  constructor(
    private readonly servicesService: ServicesService,
    private readonly tenant: TenantContextService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadServices();
  }

  loadServices(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.servicesService.list(this.shopId).subscribe({
      next: (items) => {
        this.services = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openNew(): void {
    this.editingService = null;
    this.form = {
      name: '',
      durationMins: 30,
      price: 0,
    };
    this.serviceDialogVisible = true;
  }

  editService(service: Service): void {
    this.editingService = service;
    this.form = {
      name: service.name,
      durationMins: service.durationMins,
      price: service.price,
    };
    this.serviceDialogVisible = true;
  }

  saveService(): void {
    if (!this.shopId) return;
    const baseInput = {
      shopId: this.shopId,
      name: this.form.name,
      description: null,
      durationMins: this.form.durationMins,
      price: this.form.price,
      currency: 'USD',
      isActive: true,
    };

    const input = this.editingService
      ? { ...baseInput, id: this.editingService.id }
      : baseInput;

    this.servicesService.upsert(input).subscribe({
      next: () => {
        this.serviceDialogVisible = false;
        this.loadServices();
        this.notifications.success(
          this.editingService ? 'Service updated' : 'Service created',
        );
      },
      error: () => {
        this.serviceDialogVisible = false;
        this.notifications.error('Failed to save service');
      },
    });
  }

  archiveService(service: Service): void {
    this.servicesService.archive(service.id).subscribe({
      next: () => {
        this.loadServices();
        this.notifications.warn('Service archived');
      },
      error: () => {
        this.notifications.error('Failed to archive service');
      },
    });
  }
}


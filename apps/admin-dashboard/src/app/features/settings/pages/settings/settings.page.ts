import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../../../core/services/shop.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPageComponent implements OnInit {
  /** Tracks which card is currently saving */
  saving: Record<string, boolean> = {
    profile: false,
    branch:  false,
    hours:   false,
    plan:    false,
  };

  shopId: string | null = null;

  shopForm = {
    name:        '',
    description: '',
    phone:       '',
    email:       '',
    country:     'US',
    timezone:    'America/New_York',
    currency:    'USD',
  };

  branchForm = {
    name:    '',
    address: '',
    city:    '',
    phone:   '',
  };

  hoursForm = {
    openTime:  '09:00',
    closeTime: '18:00',
  };

  subscriptionForm = {
    plan: 'PRO',
  };

  countries = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'Canada',         value: 'CA' },
    { label: 'Australia',      value: 'AU' },
    { label: 'India',          value: 'IN' },
  ];

  timezones = [
    { label: 'America/New_York',    value: 'America/New_York' },
    { label: 'America/Chicago',     value: 'America/Chicago' },
    { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
    { label: 'Europe/London',       value: 'Europe/London' },
    { label: 'Europe/Paris',        value: 'Europe/Paris' },
    { label: 'Asia/Kolkata',        value: 'Asia/Kolkata' },
    { label: 'Asia/Dubai',          value: 'Asia/Dubai' },
  ];

  currencies = [
    { label: 'USD — US Dollar',      value: 'USD' },
    { label: 'EUR — Euro',           value: 'EUR' },
    { label: 'GBP — British Pound',  value: 'GBP' },
    { label: 'INR — Indian Rupee',   value: 'INR' },
    { label: 'AED — UAE Dirham',     value: 'AED' },
    { label: 'CAD — Canadian Dollar', value: 'CAD' },
  ];

  plans = [
    { label: 'Free',       value: 'FREE' },
    { label: 'Pro',        value: 'PRO' },
    { label: 'Enterprise', value: 'ENTERPRISE' },
  ];

  constructor(
    private readonly shopService:  ShopService,
    private readonly tenant:       TenantContextService,
    private readonly auth:         AuthService,
    private readonly notify:       NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId() ?? this.auth.getShopId();
    this.loadShop();
  }

  private loadShop(): void {
    this.shopService.getMyShop().subscribe({
      next: (shop) => {
        this.shopId = shop.id;
        this.shopForm.name        = shop.name        ?? '';
        this.shopForm.description = shop.description ?? '';
      },
      error: () => {
        // Non-blocking: page still usable with empty form
      },
    });
  }

  // ── Shop Profile ── wired to real updateShop mutation ──────────────────────

  saveShopProfile(): void {
    if (!this.shopId || !this.shopForm.name.trim()) {
      this.notify.warn('Validation', 'Shop name is required.');
      return;
    }
    this.saving['profile'] = true;

    this.shopService.updateShop(this.shopId, {
      name:        this.shopForm.name.trim(),
      description: this.shopForm.description.trim() || undefined,
    }).subscribe({
      next: (shop) => {
        this.saving['profile'] = false;
        this.shopForm.name        = shop.name;
        this.shopForm.description = shop.description ?? '';
        this.notify.success('Saved', 'Shop profile updated successfully.');
      },
      error: (err) => {
        this.saving['profile'] = false;
        const msg = err?.graphQLErrors?.[0]?.message ?? 'Could not save shop profile.';
        this.notify.error('Save failed', msg);
      },
    });
  }

  // ── Branch Settings ── mock save (no branch mutation in Phase-1 backend) ───

  saveBranchSettings(): void {
    if (!this.branchForm.name.trim()) {
      this.notify.warn('Validation', 'Branch name is required.');
      return;
    }
    this.saving['branch'] = true;
    // Simulate async save for demo
    setTimeout(() => {
      this.saving['branch'] = false;
      this.notify.success('Saved', 'Branch details updated.');
    }, 600);
  }

  // ── Business Hours ── mock save ─────────────────────────────────────────────

  saveBusinessHours(): void {
    this.saving['hours'] = true;
    setTimeout(() => {
      this.saving['hours'] = false;
      this.notify.success('Saved', 'Business hours updated.');
    }, 600);
  }

  // ── Subscription ── mock save ───────────────────────────────────────────────

  saveSubscription(): void {
    this.saving['plan'] = true;
    setTimeout(() => {
      this.saving['plan'] = false;
      this.notify.success('Plan updated', `You are now on the ${this.subscriptionForm.plan} plan.`);
    }, 800);
  }
}

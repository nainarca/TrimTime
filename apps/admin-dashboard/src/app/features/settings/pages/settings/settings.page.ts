import { Component } from '@angular/core';

@Component({
  selector: 'tt-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPageComponent {
  shopForm = {
    name: '',
    description: '',
    phone: '',
    email: '',
    country: 'US',
    timezone: 'America/New_York',
    currency: 'USD',
  };

  branchForm = {
    name: '',
    address: '',
    city: '',
    phone: '',
  };

  hoursForm = {
    openTime: '09:00',
    closeTime: '18:00',
  };

  subscriptionForm = {
    plan: 'PRO',
  };

  countries = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'GB' },
  ];

  timezones = [
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'Europe/London', value: 'Europe/London' },
  ];

  currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
  ];

  plans = [
    { label: 'Free', value: 'FREE' },
    { label: 'Pro', value: 'PRO' },
    { label: 'Enterprise', value: 'ENTERPRISE' },
  ];

  saveShopProfile(): void {
    // TODO: integrate GraphQL mutation
  }

  saveBranchSettings(): void {
    // TODO: integrate GraphQL mutation
  }

  saveBusinessHours(): void {
    // TODO: integrate GraphQL mutation
  }

  saveSubscription(): void {
    // TODO: integrate GraphQL mutation
  }
}


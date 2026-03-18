import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-scanner-page',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage {
  shopSlug = '';
  scanning = false;

  constructor(private readonly router: Router) {}

  simulateScan(): void {
    if (this.scanning) return;
    this.scanning = true;
    // Capacitor BarcodeScanner plugin goes here.
    // Demo: navigate to seeded shop after 1.8 s
    setTimeout(() => {
      this.scanning = false;
      this.router.navigate(['/shop', 'mikes-barber-shop']);
    }, 1800);
  }

  goToShop(): void {
    const slug = this.shopSlug.trim();
    if (!slug) return;
    this.router.navigate(['/shop', slug]);
  }
}

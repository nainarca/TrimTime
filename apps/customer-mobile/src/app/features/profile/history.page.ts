import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-history-page',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/profile"></ion-back-button></ion-buttons>
        <ion-title>Service History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <ion-list>
        <ion-item>
          <ion-label>
            <h3>Apr 15, 2026</h3>
            <p>Classic cut - Completed</p>
          </ion-label>
          <ion-note slot="end">$28</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Apr 10, 2026</h3>
            <p>Beard trim - Completed</p>
          </ion-label>
          <ion-note slot="end">$15</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      .custom-bg { background: #f5f7fb; }
    `,
  ],})
export class HistoryPage {}

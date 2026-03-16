import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-served-page',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Service Complete</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Thank You!</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Your service is complete. We appreciate your visit.</p>
          <ion-button expand="full" routerLink="/scan">Back to Scanner</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
})
export class ServedPage {}

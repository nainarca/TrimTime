import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-served-page',
  imports: [CommonModule, DatePipe, RouterModule, IonicModule],
  templateUrl: './served.page.html',
  styleUrls: ['./served.page.scss'],
})
export class ServedPage {
  rating = 0;
  today  = new Date();

  setRating(r: number): void {
    this.rating = r;
  }
}

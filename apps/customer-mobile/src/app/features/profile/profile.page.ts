import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface HistoryEntry {
  date: string;
  service: string;
  shop: string;
  price: string;
  status: 'Completed' | 'No-show';
}

@Component({
  standalone: true,
  selector: 'tt-profile-page',
  imports: [CommonModule, RouterModule, IonicModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  userName  = 'Guest Customer';
  userPhone = '+1 (555) 000-0000';
  joined    = 'March 2026';
  initials  = 'GC';

  // Preferences
  notificationsOn = true;
  smsAlertsOn     = true;

  // Loyalty / streak
  currentStreak   = 3;   // consecutive visits this month
  rewardProgress  = 3;   // visits completed toward next reward
  rewardGoal      = 5;   // visits needed
  rewardLabel     = 'Free Beard Trim';
  rewardProgressPct = Math.round((this.rewardProgress / this.rewardGoal) * 100);

  history: HistoryEntry[] = [
    { date: 'Apr 15, 2026', service: 'Classic Haircut',  shop: 'Mike\'s Barber', price: '$25', status: 'Completed' },
    { date: 'Apr 10, 2026', service: 'Beard Trim',       shop: 'Mike\'s Barber', price: '$15', status: 'Completed' },
    { date: 'Apr 3, 2026',  service: 'Haircut + Beard',  shop: 'Mike\'s Barber', price: '$35', status: 'Completed' },
  ];

  totalVisits  = this.history.length;
  totalSpent   = this.history.reduce((s, h) => s + parseInt(h.price.replace('$', '')), 0);
  avgWait      = 12;

  get rewardSteps(): boolean[] {
    return Array.from({ length: this.rewardGoal }, (_, i) => i < this.rewardProgress);
  }
}

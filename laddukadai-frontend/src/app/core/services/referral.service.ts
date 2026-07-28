import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReferralResponse, ReferralStats, Reward } from '../models/referral.model';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/referrals`;

  getMyStats(): Observable<ReferralStats> {
    return this.http.get<ReferralStats>(`${this.apiUrl}/my-stats`);
  }

  getMyRewards(): Observable<Reward[]> {
    return this.http.get<Reward[]>(`${this.apiUrl}/my-rewards`);
  }

  applyReward(rewardId: number, orderId: number): Observable<Reward> {
    return this.http.post<Reward>(`${this.apiUrl}/apply-reward?rewardId=${rewardId}&orderId=${orderId}`, {});
  }

  getAllReferrals(): Observable<ReferralResponse[]> {
    return this.http.get<ReferralResponse[]>(`${this.apiUrl}/all`);
  }

  getLeaderboard(): Observable<ReferralStats[]> {
    return this.http.get<ReferralStats[]>(`${this.apiUrl}/leaderboard`);
  }
}

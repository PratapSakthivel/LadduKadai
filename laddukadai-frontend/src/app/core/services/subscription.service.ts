import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subscription, SubscriptionRequest } from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  createSubscription(request: SubscriptionRequest): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, request);
  }

  getMySubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/my`);
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/all`);
  }

  pauseSubscription(id: number, pauseUntilDate: string): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/${id}/pause?pauseUntilDate=${pauseUntilDate}`, {});
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/${id}/cancel`, {});
  }

  resumeSubscription(id: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/${id}/resume`, {});
  }

  processDeliveries(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/process-deliveries`, {}, { responseType: 'text' as 'json' });
  }
}

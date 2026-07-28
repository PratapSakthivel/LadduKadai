import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Delivery, EodReport, MarkDeliveredRequest, MarkNotHomeRequest, MarkRejectedRequest } from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/deliveries`;

  getTodayDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.apiUrl}/today`);
  }

  assignDelivery(orderId: number, deliveryManId: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.apiUrl}/assign/${orderId}?deliveryManId=${deliveryManId}`, {});
  }

  markDelivered(id: number, request: MarkDeliveredRequest): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.apiUrl}/${id}/delivered`, request);
  }

  markNotHome(id: number, request: MarkNotHomeRequest): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.apiUrl}/${id}/not-home`, request);
  }

  markRejected(id: number, request: MarkRejectedRequest): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.apiUrl}/${id}/rejected`, request);
  }

  submitEodReport(): Observable<EodReport> {
    return this.http.post<EodReport>(`${this.apiUrl}/eod`, {});
  }

  getAllEodReports(): Observable<EodReport[]> {
    return this.http.get<EodReport[]>(`${this.apiUrl}/eod/all`);
  }

  verifyEodReport(id: number): Observable<EodReport> {
    return this.http.patch<EodReport>(`${this.apiUrl}/eod/${id}/verify`, {});
  }

  reverseDelivery(id: number): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.apiUrl}/${id}/reverse`, {});
  }
}

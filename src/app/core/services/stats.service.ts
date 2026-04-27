import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatsOverview {
  totalUsers: number;
  activeUsers: number;
}

export interface PingResponse {
  message: string;
}

/**
 * Stats Service - Manages user count and online user tracking
 * 
 * Features:
 * - Fetches total user count from database
 * - Tracks active/online users via periodic pings
 * - Automatically removes inactive users after timeout (default 6 minutes)
 * 
 * How it works:
 * 1. User logs in and TopbarComponent calls startPingInterval()
 * 2. Immediately fetches current stats via GET /api/stats/overview
 * 3. Every 60 seconds:
 *    - POSTs to /api/stats/ping (requires auth) to register activity
 *    - Fetches updated stats
 *    - Updates the stats$ BehaviorSubject observable
 * 4. Backend tracks this user as "active" for timeout duration (default 6 min)
 * 5. When user logs out or closes browser, stopPingInterval() is called
 */
@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/stats`;

  private statsSubject = new BehaviorSubject<StatsOverview | null>(null);
  stats$ = this.statsSubject.asObservable();

  // Polling reference - keeps track of the interval subscription
  private pingSubscription: any;

  /**
   * Get current stats overview
   * @returns totalUsers and activeUsers counts
   */
  getOverview(): Observable<StatsOverview> {
    return this.http.get<StatsOverview>(`${this.apiUrl}/overview`);
  }

  /**
   * Send ping to register user activity
   * Must be authenticated - backend records current username as active
   * @returns Ping confirmation
   */
  ping(): Observable<PingResponse> {
    // POST /api/stats/ping with authentication to register user activity
    return this.http.post<PingResponse>(`${this.apiUrl}/ping`, {});
  }

  /**
   * Start periodic ping and stats refresh
   * Immediately fetches stats, then pings server every 60 seconds
   */
  startPingInterval(): void {
    if (this.pingSubscription) {
      return;
    }
    
    // Fetch stats immediately
    this.refreshStats();

    // Ping /api/stats/ping every 60 seconds (60000ms), then refresh stats
    this.pingSubscription = interval(60000).pipe(
      switchMap(() => this.ping()),
      switchMap(() => this.getOverview()),
      catchError((err) => {
        console.error('Failed to ping/refresh stats', err);
        return of(null);
      })
    ).subscribe({
      next: (stats) => {
        if (stats) {
          this.statsSubject.next(stats);
        }
      }
    });
  }

  /**
   * Fetch stats once without setting up interval
   */
  refreshStats(): void {
    this.getOverview().pipe(
      catchError((err) => {
        console.error('Failed to get stats overview', err);
        return of(null);
      })
    ).subscribe({
      next: (stats) => {
        if (stats) {
          this.statsSubject.next(stats);
        }
      }
    });
  }

  /**
   * Stop periodic ping and stats refresh
   * Called when user logs out or component is destroyed
   */
  stopPingInterval(): void {
    if (this.pingSubscription) {
      this.pingSubscription.unsubscribe();
      this.pingSubscription = null;
    }
  }
}

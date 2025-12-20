// src/app/news/data-access/news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NewsItem, PollingIntervalResponse } from './news/+state/news.models';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  /* REST endpoints */

  /** GET /config/polling-interval */
  getPollingInterval() {
    return this.http
      .get<PollingIntervalResponse>(`${this.baseUrl}/config/polling-interval`)
      .pipe(map(res => res.pollingIntervalSeconds));
  }
  /** POST /config/polling-interval?seconds=x */
  setPollingInterval(seconds: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/config/polling-interval?seconds=${seconds}`,
      null,
    );
  }

  /* SSE stream */
  streamNews(eventNames: string[] = ['NEWS'], debugLabel = 'NEWS_STREAM'): Observable<NewsItem> {
    const url = `${this.baseUrl}/news`;
    return new Observable<NewsItem>((subscriber) => {
      console.log(`[${debugLabel}] opening`, url, 'events:', eventNames);

      const es = new EventSource(url);

      const handler = (evt: MessageEvent) => {
        console.log(`[${debugLabel}] event`, evt.type, 'raw:', evt.data);
        try {
          const parsed = JSON.parse(evt.data) as NewsItem;
          console.log(`[${debugLabel}] parsed`, parsed);
          subscriber.next(parsed);
        } catch (e) {
          console.error(`[${debugLabel}] JSON parse error`, e);
          subscriber.error(e);
        }
      };

      for (const name of eventNames) {
        if (name === 'message') {
          es.onmessage = handler;
        } else {
          es.addEventListener(name, handler as EventListener);
        }
      }

      es.onerror = (err) => {
        console.error(`[${debugLabel}] error`, err);
        subscriber.error(new Error('SSE connection error'));
      };

      es.onopen = () => {
        console.log(`[${debugLabel}] open`);
      };

      return () => {
        console.log(`[${debugLabel}] closing`);
        for (const name of eventNames) {
          if (name !== 'message') es.removeEventListener(name, handler as EventListener);
        }
        es.close();
      };
    });
  }
}

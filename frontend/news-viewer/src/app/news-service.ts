// src/app/news.service.ts
import { Injectable, signal } from '@angular/core';

export interface NewsItem {
  title: string;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  newsItems = signal<NewsItem[]>([]);
  connected = signal(false);
  pollingInterval = signal(60);
  intervals = signal([10, 20, 30, 40, 50, 60]);

  private eventSource?: EventSource;

  connectSSE(url: string) {
    this.eventSource?.close();
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.connected.set(true);
    };

    this.eventSource.addEventListener('NEWS', (event) => {
      const news: NewsItem = JSON.parse((event as MessageEvent).data);

      const updated = [news, ...this.newsItems()]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 20);

      this.newsItems.set(updated);
    });

    this.eventSource.onerror = () => {
      this.connected.set(false);
      setTimeout(() => this.connectSSE(url), 5000);
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.connected.set(false);
  }

  loadCurrentInterval() {
    fetch('/config/polling-interval')
      .then((r) => r.json())
      .then((value) => {
        this.pollingInterval.set(value.pollingIntervalSeconds);
      })
      .catch(() => {});
  }

  changeInterval(seconds: number) {
    this.pollingInterval.set(seconds);
    const params = new URLSearchParams({ seconds: String(seconds) });
    fetch('/config/polling-interval?' + params.toString(), {
      method: 'POST',
    }).catch(() => {});
  }
}

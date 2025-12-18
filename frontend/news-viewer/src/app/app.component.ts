import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsItem {
  title: string;
  content: string;
  timestamp: string;
}

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule } from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  connected = false;
  pollingInterval = 60;
  intervals = [10, 20, 30, 40, 50, 60];

  private eventSource?: EventSource;

  ngOnInit() {
    this.connectSSE('/news');
    this.loadCurrentInterval();
  }

  ngOnDestroy() {
    this.eventSource?.close();
  }

  private connectSSE(url: string) {
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.connected = true;
    };

    this.eventSource.addEventListener('NEWS', (event) => {
      const news: NewsItem = JSON.parse((event as MessageEvent).data);

      // normalize timestamp to Date for sorting
      const normalized: NewsItem = {
        ...news,
        timestamp: news.timestamp
      };

      this.newsItems = [normalized, ...this.newsItems];

      // sort descending (newest first)
      this.newsItems.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // keep last 20
      this.newsItems = this.newsItems.slice(0, 20);
    });


    this.eventSource.onerror = () => {
      this.connected = false;
      setTimeout(() => this.connectSSE(url), 5000); // Reconnect
    };
  }

  isNew(news: NewsItem): boolean {
    return this.newsItems.indexOf(news) < 3;
  }

  trackByTitle(index: number, item: NewsItem): string {
    return item.title;
  }

  loadCurrentInterval() {
    fetch('/config/polling-interval')
      .then(r => r.json())
      .then(value => {
        this.pollingInterval = value.pollingIntervalSeconds;  // 30
      });
  }

  changeInterval(seconds: number) {
    this.pollingInterval = seconds;
    const params = new URLSearchParams({ seconds: String(seconds) });
    fetch('/config/polling-interval?' + params.toString(), {
      method: 'POST'
    }).catch(() => {});
  }

}

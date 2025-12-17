import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsItem {
  title: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  connected = false;
  private eventSource?: EventSource;

  ngOnInit() {
    this.connectSSE('/news');
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
}

// src/app/news.ts
import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {NewsItem, NewsService} from "../news-service";

@Component({
  selector: 'app-news',
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
  templateUrl: './news.html',
  styleUrls: ['./news.css'],
})
export class NewsComponent implements OnInit, OnDestroy {
  private readonly newsService = inject(NewsService);

  // expose signals from service
  newsItems = this.newsService.newsItems;
  connected = this.newsService.connected;
  pollingInterval = this.newsService.pollingInterval;
  intervals = this.newsService.intervals;

  // derived
  newItems = computed(() => this.newsItems().slice(0, 3));

  ngOnInit(): void {
    this.newsService.connectSSE('/news');
    this.newsService.loadCurrentInterval();
  }

  ngOnDestroy(): void {
    this.newsService.disconnect();
  }

  isNew(news: NewsItem): boolean {
    return this.newItems().includes(news);
  }

  trackByTitle(index: number, item: NewsItem): string {
    return item.title;
  }

  changeInterval(seconds: number) {
    this.newsService.changeInterval(seconds);
  }
}

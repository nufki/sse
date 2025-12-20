import { ChangeDetectionStrategy, Component, computed, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  selectConnection,
  selectNewsItems,
  selectPollingIntervalSeconds,
} from '../+state/news.selectors';
import { ConnectionStatus, NewsItem } from '../+state/news.models';
import { NewsActions } from '../+state/news.actions';
import {DEFAULT_INTERVAL} from '../+state/news.reducer';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsComponent implements OnInit {
  readonly items: Signal<NewsItem[]>;
  readonly connection: Signal<ConnectionStatus>;
  readonly pollingIntervalSeconds: Signal<number | null>;
  readonly connected: Signal<boolean>;

  readonly intervalOptions = [10, 20, 30, 40, 50, DEFAULT_INTERVAL] as const;
  private readonly firstSeen = new Map<string, number>();
  private readonly newWindowMs = 30_000;

  constructor(private readonly store: Store) {
    this.items = this.store.selectSignal(selectNewsItems);
    this.connection = this.store.selectSignal(selectConnection);
    this.pollingIntervalSeconds = this.store.selectSignal(selectPollingIntervalSeconds);

    this.connected = computed(() => this.connection() === ConnectionStatus.Connected);
  }

  ngOnInit(): void {
    this.store.dispatch(NewsActions.pageEntered());
  }

  setInterval(seconds: number): void {
    this.store.dispatch(NewsActions.setPollingInterval({ seconds }));
  }

  // Not used at the moment
  disconnect(): void {
    this.store.dispatch(NewsActions.disconnect());
  }

  isNew(item: NewsItem): boolean {
    const key = item.title;
    const now = Date.now();
    const seenAt = this.firstSeen.get(key);

    if (seenAt == null) {
      this.firstSeen.set(key, now);
      return true;
    }
    return now - seenAt < this.newWindowMs; // return true if item is less 30s old
  }
}

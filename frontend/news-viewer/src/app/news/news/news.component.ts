import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Store} from '@ngrx/store';
import {map, Observable} from 'rxjs';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';

import {selectConnection, selectNewsItems, selectPollingIntervalSeconds} from '../+state/news.selectors';
import {ConnectionStatus, NewsItem} from '../+state/news.models';
import {NewsActions} from '../+state/news.actions';
import {MatIconModule} from '@angular/material/icon';

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
  readonly items$: Observable<NewsItem[]>;
  readonly connection$: Observable<ConnectionStatus>;
  readonly pollingIntervalSeconds$: Observable<number | null>;
  readonly connected$: Observable<boolean>;
  readonly intervalOptions = [10, 20, 30, 40, 50, 60];

  private readonly firstSeen = new Map<string, number>();
  private readonly newWindowMs = 30_000;

  constructor(private readonly store: Store) {
    this.items$ = this.store.select(selectNewsItems);
    this.connection$ = this.store.select(selectConnection);
    this.pollingIntervalSeconds$ = this.store.select(selectPollingIntervalSeconds);

    this.connected$ = this.connection$.pipe(
      map((s) => s === ConnectionStatus.Connected)
    );
  }

  ngOnInit(): void {
    this.store.dispatch(NewsActions.pageEntered());
  }

  setInterval(seconds: number) {
    this.store.dispatch(NewsActions.setPollingInterval({seconds}));
  }

  disconnect() {
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
    return now - seenAt < this.newWindowMs;
  }
}

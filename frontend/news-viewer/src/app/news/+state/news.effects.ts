import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  concatMap,
  map,
  merge,
  mergeMap,
  of,
  retry,
  scan,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';

import { NewsActions } from './news.actions';
import { NewsItem } from './news.models';
import { SseClientService } from '../../sse-client.service';

@Injectable()
export class NewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly sse = inject(SseClientService);

  /** Kick off initial load + SSE connect */
  pageEntered$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.pageEntered),
      switchMap(() => [NewsActions.loadPollingInterval(), NewsActions.connect()]),
    ),
  );

  /** GET /config/polling-interval */
  loadPollingInterval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.loadPollingInterval),
      switchMap(() =>
        this.http.get<number>('/config/polling-interval').pipe(
          map((seconds) => NewsActions.loadPollingIntervalSuccess({ seconds })),
          catchError((e) =>
            of(NewsActions.loadPollingIntervalFailure({ error: String(e?.message ?? e) })),
          ),
        ),
      ),
    ),
  );

  /** POST /config/polling-interval?seconds=x */
  setPollingInterval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.setPollingInterval),
      concatMap(({ seconds }) =>
        this.http.post<void>(`/config/polling-interval?seconds=${seconds}`, null).pipe(
          map(() => NewsActions.setPollingIntervalSuccess({ seconds })),
          catchError((e) =>
            of(NewsActions.setPollingIntervalFailure({ error: String(e?.message ?? e) })),
          ),
        ),
      ),
    ),
  );

  /** SSE connect: listen to event:NEWS and dispatch connected() once, then items continuously */
  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.connect),
      switchMap(() => {
        const stop$ = merge(
          this.actions$.pipe(ofType(NewsActions.disconnect)),
          this.actions$.pipe(ofType(NewsActions.pageLeft)),
        );

        return this.sse.streamJson<NewsItem>('/news', ['NEWS'], 'NEWS_STREAM').pipe(
          // Mark first message so we can dispatch connected() only once
          scan(
            (acc, item) => ({
              item,
              first: !acc.seen,
              seen: true,
            }),
            { seen: false, first: false, item: null as unknown as NewsItem },
          ),

          // Emit 1 or 2 actions per item
          mergeMap(({ item, first }) =>
            first
              ? [NewsActions.connected(), NewsActions.messageReceived({ item })]
              : [NewsActions.messageReceived({ item })],
          ),

          // Retry SSE on errors (but stop if user disconnects / page leaves)
          retry({
            count: Infinity,
            delay: (_err, retryCount) => timer(Math.min(1000 * retryCount, 15000)),
          }),

          takeUntil(stop$),

          // In practice with retry(Infinity) this won't run often,
          // but keep it for safety if you change retry policy.
          catchError((e) => of(NewsActions.error({ error: String(e?.message ?? e) }))),
        );
      }),
    ),
  );
}

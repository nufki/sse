import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, merge, mergeMap, of, retry, scan, switchMap, takeUntil, timer } from 'rxjs';

import { NewsActions } from './news.actions';
import { NewsItem } from './news.models';
import { NewsService } from '../../news.service';

@Injectable()
export class NewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly newsService = inject(NewsService);

  /** Kick off initial load + SSE connect */
  pageEntered$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.pageEntered),
      switchMap(() => [NewsActions.loadPollingInterval(), NewsActions.connect()]),
    ),
  );

  loadPollingInterval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.loadPollingInterval),
      switchMap(() =>
        this.newsService.getPollingInterval().pipe(
          map((seconds) => NewsActions.loadPollingIntervalSuccess({ seconds })),
          catchError((e) =>
            of(NewsActions.loadPollingIntervalFailure({ error: String(e?.message ?? e) })),
          ),
        ),
      ),
    ),
  );

  setPollingInterval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.setPollingInterval),
      concatMap(({ seconds }) =>
        this.newsService.setPollingInterval(seconds).pipe(
          map(() => NewsActions.setPollingIntervalSuccess({ seconds })),
          catchError((e) =>
            of(NewsActions.setPollingIntervalFailure({ error: String(e?.message ?? e) })),
          ),
        ),
      ),
    ),
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.connect),
      switchMap(() => {
        const stop$ = merge(
          this.actions$.pipe(ofType(NewsActions.disconnect)),
          this.actions$.pipe(ofType(NewsActions.pageLeft)),
        );

        return this.newsService.streamNews(['NEWS'], 'NEWS_STREAM').pipe(
          scan(
            (acc, item) => ({
              item,
              first: !acc.seen,
              seen: true,
            }),
            { seen: false, first: false, item: null as unknown as NewsItem },
          ),
          mergeMap(({ item, first }) =>
            first
              ? [NewsActions.connected(), NewsActions.messageReceived({ item })]
              : [NewsActions.messageReceived({ item })],
          ),
          retry({
            count: Infinity,
            delay: (_err, retryCount) => timer(Math.min(1000 * retryCount, 15000)),
          }),
          takeUntil(stop$),
          catchError((e) => of(NewsActions.error({ error: String(e?.message ?? e) }))),
        );
      }),
    ),
  );
}

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {DEFAULT_INTERVAL, NewsState} from './news.reducer';

export const selectNewsState = createFeatureSelector<NewsState>('news');
export const selectNewsItems = createSelector(selectNewsState, (s) => s.items);
export const selectConnection = createSelector(selectNewsState, (s) => s.connection);
export const selectPollingIntervalSeconds = createSelector(
  selectNewsState,
  (s) => s.pollingIntervalSeconds,
);
export const selectError = createSelector(selectNewsState, (s) => s.error);

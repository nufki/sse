import { createReducer, on } from '@ngrx/store';
import { ConnectionStatus, NewsItem } from './news.models';
import { NewsActions } from './news.actions';

export const DEFAULT_INTERVAL = 60

export interface NewsState {
  items: NewsItem[];
  connection: ConnectionStatus;
  pollingIntervalSeconds: number | null;
  error: string | null;
}

export const initialState: NewsState = {
  items: [],
  connection: ConnectionStatus.Disconnected,
  pollingIntervalSeconds: DEFAULT_INTERVAL,
  error: null,
};

export const newsReducer = createReducer(
  initialState,

  on(NewsActions.pageEntered, (s) => ({ ...s, error: null })),

  on(NewsActions.connect, (s) => ({ ...s, connection: ConnectionStatus.Connecting, error: null })),
  on(NewsActions.connected, (s) => ({ ...s, connection: ConnectionStatus.Connected })),
  on(NewsActions.disconnect, (s) => ({ ...s, connection: ConnectionStatus.Disconnected })),
  on(NewsActions.error, (s) => ({ ...s, connection: ConnectionStatus.Disconnected })),

  on(NewsActions.messageReceived, (s, { item }) => ({
    ...s,
    // keep immutable (important in Angular 21’s zoneless default; async pipe + immutable patterns are your friend) :contentReference[oaicite:3]{index=3}
    items: [item, ...s.items].slice(0, 200),
  })),

  on(NewsActions.loadPollingIntervalSuccess, (s, { seconds }) => ({
    ...s,
    pollingIntervalSeconds: seconds,
  })),

  on(NewsActions.setPollingIntervalSuccess, (s, { seconds }) => ({
    ...s,
    pollingIntervalSeconds: seconds,
  })),
);

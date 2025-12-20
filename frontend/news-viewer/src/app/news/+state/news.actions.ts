import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NewsItem } from './news.models';

export const NewsActions = createActionGroup({
  source: 'News',
  events: {
    'Page Entered': emptyProps(),
    'Page Left': emptyProps(),

    Connect: emptyProps(),
    Disconnect: emptyProps(),

    Connected: emptyProps(),
    Disconnected: emptyProps(),
    'Message Received': props<{ item: NewsItem }>(),
    Error: props<{ error: string }>(),

    'Load Polling Interval': emptyProps(),
    'Load Polling Interval Success': props<{ seconds: number }>(),
    'Load Polling Interval Failure': props<{ error: string }>(),

    'Set Polling Interval': props<{ seconds: number }>(),
    'Set Polling Interval Success': props<{ seconds: number }>(),
    'Set Polling Interval Failure': props<{ error: string }>(),
  },
});

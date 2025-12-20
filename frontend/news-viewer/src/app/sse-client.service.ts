import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseClientService {
  streamJson<T>(
    url: string,
    eventNames: string[] = ['message'],
    debugLabel = 'SSE',
  ): Observable<T> {
    return new Observable<T>((subscriber) => {
      console.log(`[${debugLabel}] opening`, url, 'events:', eventNames);

      const es = new EventSource(url);

      const handler = (evt: MessageEvent) => {
        // evt.type will be "NEWS" for event:NEWS
        console.log(`[${debugLabel}] event`, evt.type, 'raw:', evt.data);

        try {
          const parsed = JSON.parse(evt.data) as T;
          console.log(`[${debugLabel}] parsed`, parsed);
          subscriber.next(parsed);
        } catch (e) {
          console.error(`[${debugLabel}] JSON parse error`, e);
          subscriber.error(e);
        }
      };

      for (const name of eventNames) {
        if (name === 'message') {
          es.onmessage = handler;
        } else {
          es.addEventListener(name, handler as EventListener);
        }
      }

      es.onerror = (err) => {
        console.error(`[${debugLabel}] error`, err);
        subscriber.error(new Error('SSE connection error'));
      };

      es.onopen = () => {
        console.log(`[${debugLabel}] open`);
      };

      return () => {
        console.log(`[${debugLabel}] closing`);
        for (const name of eventNames) {
          if (name !== 'message') es.removeEventListener(name, handler as EventListener);
        }
        es.close();
      };
    });
  }
}

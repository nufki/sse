import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {newsReducer} from './news/+state/news.reducer';
import {NewsEffects} from './news/+state/news.effects';


export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({news: newsReducer}),
    provideEffects([NewsEffects]),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),
  ],
};

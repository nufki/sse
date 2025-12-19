import {Component} from '@angular/core';
import {NewsComponent} from "./news/news/news.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NewsComponent],
  template: `<app-news></app-news>`,
  styleUrl: './app.css'   // keep if you have global styles
})
export class App {
}

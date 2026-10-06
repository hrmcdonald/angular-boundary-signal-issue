import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <h1><code>&#64;boundary</code> + signal writes → <code>NG0600</code></h1>
    <p>
      Reproduction for
      <a href="https://github.com/angular/angular/issues/71199">angular/angular#71199</a>. Open the
      browser console, then click "Render throwing child". Reload the page to run a scenario again.
    </p>

    <nav>
      <a routerLink="/decorator-query" routerLinkActive="active">Control: &#64;ViewChild()</a>
      <a routerLink="/signal-query" routerLinkActive="active">Bug 1: viewChild()</a>
      <a routerLink="/signal-writing-error-handler" routerLinkActive="active">
        Bug 2: ErrorHandler writes a signal
      </a>
    </nav>

    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}

import { Component, ErrorHandler, inject, Injectable, signal } from '@angular/core';
import { ScenarioState, ThrowingChild } from '../throwing-child';

/** Errors the app wants to show in its UI, for example in a toast or an error panel. */
@Injectable()
export class ErrorLog {
  readonly errors = signal<unknown[]>([]);
}

/** A typical app ErrorHandler that logs errors and records them in a signal. */
@Injectable()
export class SignalWritingErrorHandler implements ErrorHandler {
  private readonly log = inject(ErrorLog);

  handleError(error: unknown): void {
    console.error(error);
    this.log.errors.update((errors) => [...errors, error]);
  }
}

@Component({
  selector: 'app-signal-writing-error-handler',
  imports: [ThrowingChild],
  providers: [ScenarioState],
  template: `
    <h2>Bug 2: <code>ErrorHandler</code> that writes a signal</h2>
    <p>
      This component declares a <code>&#64;boundary</code> and has no view queries. The app's
      <code>ErrorHandler</code> records each error in a signal.
    </p>
    <p>
      <strong>Expected:</strong> <code>&#64;error</code> shows the original error, the failed child
      is destroyed, and the <code>ErrorHandler</code> records 1 error.<br />
      <strong>Actual:</strong> <code>&#64;error</code> never renders, the failed child is never
      destroyed, and <code>NG0600</code> is thrown from the <code>ErrorHandler</code>.
    </p>

    <button type="button" (click)="show.set(true)" [disabled]="show()">
      Render throwing child
    </button>

    @boundary {
      @if (show()) {
        <app-throwing-child />
      }
    } @error (let error = $error) {
      <p class="caught">Caught by &#64;error: {{ error.message }}</p>
    }

    <p class="status">ThrowingChild destroyed: {{ state.childDestroyed() }}</p>
    <p class="status">Errors recorded by ErrorHandler: {{ log.errors().length }}</p>
  `,
})
export class SignalWritingErrorHandlerScenario {
  protected readonly state = inject(ScenarioState);
  protected readonly log = inject(ErrorLog);
  protected readonly show = signal(false);
}

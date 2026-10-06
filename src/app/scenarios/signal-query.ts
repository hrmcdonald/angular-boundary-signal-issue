import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ScenarioState, ThrowingChild } from '../throwing-child';

@Component({
  selector: 'app-signal-query',
  imports: [ThrowingChild],
  providers: [ScenarioState],
  template: `
    <h2>Bug 1: signal <code>viewChild()</code></h2>
    <p>
      Same component as the control, but with a signal view query. The queried element
      (<code>#anchor</code>) is still outside the boundary.
    </p>
    <p>
      <strong>Expected:</strong> <code>&#64;error</code> shows the original error, and the failed
      child is destroyed.<br />
      <strong>Actual:</strong> <code>&#64;error</code> shows <code>NG0600</code>, and the failed
      child is never destroyed.
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

    <p #anchor class="status">ThrowingChild destroyed: {{ state.childDestroyed() }}</p>
  `,
})
export class SignalQueryScenario {
  protected readonly state = inject(ScenarioState);
  protected readonly show = signal(false);

  readonly anchor = viewChild<ElementRef<HTMLElement>>('anchor');
}

import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ScenarioState, ThrowingChild } from '../throwing-child';

@Component({
  selector: 'app-decorator-query',
  imports: [ThrowingChild],
  providers: [ScenarioState],
  template: `
    <h2>Control: decorator <code>&#64;ViewChild()</code></h2>
    <p>
      This component declares a <code>&#64;boundary</code> and a decorator view query. The queried
      element (<code>#anchor</code>) is outside the boundary.
    </p>
    <p>
      <strong>Expected and actual:</strong> <code>&#64;error</code> shows the original error, and
      the failed child is destroyed.
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
export class DecoratorQueryScenario {
  protected readonly state = inject(ScenarioState);
  protected readonly show = signal(false);

  @ViewChild('anchor') anchor?: ElementRef<HTMLElement>;
}

import { Component, inject, Injectable, OnDestroy, signal } from '@angular/core';

export const ORIGINAL_ERROR_MESSAGE = 'Original error thrown by ThrowingChild';

/** Per-scenario state. Each scenario page provides its own instance. */
@Injectable()
export class ScenarioState {
  readonly childDestroyed = signal(false);
}

/** Throws while its template renders, like any child component with a render bug. */
@Component({
  selector: 'app-throwing-child',
  template: `{{ render() }}`,
})
export class ThrowingChild implements OnDestroy {
  private readonly state = inject(ScenarioState);

  protected render(): string {
    throw new Error(ORIGINAL_ERROR_MESSAGE);
  }

  ngOnDestroy() {
    this.state.childDestroyed.set(true);
  }
}

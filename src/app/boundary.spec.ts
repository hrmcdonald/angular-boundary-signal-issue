import { ErrorHandler, inject, Injectable, Provider, Type, untracked } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DecoratorQueryScenario } from './scenarios/decorator-query';
import { SignalQueryScenario } from './scenarios/signal-query';
import {
  ErrorLog,
  SignalWritingErrorHandler,
  SignalWritingErrorHandlerScenario,
} from './scenarios/signal-writing-error-handler';
import { ORIGINAL_ERROR_MESSAGE } from './throwing-child';

// These tests assert the EXPECTED behavior. With @angular/core 22.2.1, the "Bug 1" and "Bug 2"
// tests fail. They should pass once angular/angular#71199 is fixed.

/** Records errors in a plain array. It writes no signals, so it cannot affect the boundary. */
class RecordingErrorHandler implements ErrorHandler {
  readonly errors: unknown[] = [];

  handleError(error: unknown): void {
    this.errors.push(error);
  }
}

/** The bug 2 workaround: the same signal write, wrapped in `untracked()`. */
@Injectable()
class UntrackedSignalWritingErrorHandler implements ErrorHandler {
  private readonly log = inject(ErrorLog);

  handleError(error: unknown): void {
    untracked(() => this.log.errors.update((errors) => [...errors, error]));
  }
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Renders a scenario page and clicks its "Render throwing child" button. */
async function renderThrowingChild(scenario: Type<unknown>, providers: Provider[]) {
  TestBed.configureTestingModule({
    providers,
    // Send errors that escape the boundary to the ErrorHandler, so the assertions still run
    rethrowApplicationErrors: false,
  });
  const fixture = TestBed.createComponent(scenario);
  await fixture.whenStable();

  const page = fixture.nativeElement as HTMLElement;
  page.querySelector('button')!.click();
  await fixture.whenStable();
  return page;
}

/** What a working boundary does: show the original error, report only it, destroy the child. */
function expectContainedError(page: HTMLElement, reportedErrors: unknown[]) {
  const caught = page.querySelector('.caught')?.textContent ?? '(@error block did not render)';
  expect.soft(caught).toContain(ORIGINAL_ERROR_MESSAGE);
  expect.soft(page.textContent).toContain('ThrowingChild destroyed: true');
  expect.soft(reportedErrors.map(messageOf)).toEqual([ORIGINAL_ERROR_MESSAGE]);
}

describe('Control: @boundary in a component with a decorator @ViewChild()', () => {
  it('shows the original error, reports only it, and destroys the failed child', async () => {
    const errorHandler = new RecordingErrorHandler();
    const page = await renderThrowingChild(DecoratorQueryScenario, [
      { provide: ErrorHandler, useValue: errorHandler },
    ]);

    expectContainedError(page, errorHandler.errors);
  });
});

describe('Bug 1: @boundary in a component with a signal viewChild()', () => {
  it('shows the original error, reports only it, and destroys the failed child', async () => {
    const errorHandler = new RecordingErrorHandler();
    const page = await renderThrowingChild(SignalQueryScenario, [
      { provide: ErrorHandler, useValue: errorHandler },
    ]);

    expectContainedError(page, errorHandler.errors);
  });
});

describe('Bug 2: @boundary with an app ErrorHandler that writes a signal', () => {
  it('shows the original error, reports only it, and destroys the failed child', async () => {
    const page = await renderThrowingChild(SignalWritingErrorHandlerScenario, [
      ErrorLog,
      { provide: ErrorHandler, useClass: SignalWritingErrorHandler },
    ]);

    expectContainedError(page, TestBed.inject(ErrorLog).errors());
  });

  it('works when the ErrorHandler writes the signal inside untracked() (workaround)', async () => {
    const page = await renderThrowingChild(SignalWritingErrorHandlerScenario, [
      ErrorLog,
      { provide: ErrorHandler, useClass: UntrackedSignalWritingErrorHandler },
    ]);

    expectContainedError(page, TestBed.inject(ErrorLog).errors());
  });
});

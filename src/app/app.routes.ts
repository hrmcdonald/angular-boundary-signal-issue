import { ErrorHandler } from '@angular/core';
import { Routes } from '@angular/router';
import { DecoratorQueryScenario } from './scenarios/decorator-query';
import { SignalQueryScenario } from './scenarios/signal-query';
import {
  ErrorLog,
  SignalWritingErrorHandler,
  SignalWritingErrorHandlerScenario,
} from './scenarios/signal-writing-error-handler';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'decorator-query' },
  { path: 'decorator-query', component: DecoratorQueryScenario },
  { path: 'signal-query', component: SignalQueryScenario },
  {
    path: 'signal-writing-error-handler',
    component: SignalWritingErrorHandlerScenario,
    // Route-scoped only so this ErrorHandler does not affect the other scenarios. Apps usually
    // provide it in the application config, which fails the same way.
    providers: [ErrorLog, { provide: ErrorHandler, useClass: SignalWritingErrorHandler }],
  },
];

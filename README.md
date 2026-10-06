# `@boundary` + signal writes → `NG0600`

Minimal reproduction for [angular/angular#71199](https://github.com/angular/angular/issues/71199).

When a component inside a `@boundary` throws during change detection, Angular handles the error while the failing template is still rendering. Any signal write during that handling throws `NG0600`. The result is that the boundary reports the wrong error, does not destroy the failed content, or does not render its `@error` block at all.

Tested with `@angular/core` 22.2.1 (Angular CLI 22.2.1) and Node.js 24.18.0.

## Run it

```bash
npm install
npm start   # http://localhost:4200
npm test
```

- **App:** open the browser console, choose a scenario, and click **Render throwing child**. Reload the page to run a scenario again.
- **Tests:** the tests assert the **expected** behavior. On 22.2.1, the two "Bug" tests fail and the other two pass. All four should pass once the issue is fixed.

## Scenarios

Each scenario page declares the same `@boundary` around a child component whose template throws:

```html
@boundary { @if (show()) {
<app-throwing-child />
} } @error (let error = $error) {
<p>Caught by @error: {{ error.message }}</p>
}
```

| Route                           | Setup                                                                                                         | Expected                                                       | Actual on 22.2.1                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/decorator-query`              | Control. The component has a decorator `@ViewChild()` query.                                                  | `@error` shows the original error, and the child is destroyed. | Same as expected.                                                                                                          |
| `/signal-query`                 | **Bug 1.** The same component with a signal `viewChild()` query. The queried element is outside the boundary. | Same as the control.                                           | `@error` shows `NG0600`, the child is never destroyed, and `ErrorHandler` receives both errors.                            |
| `/signal-writing-error-handler` | **Bug 2.** No view queries. The `ErrorHandler` records each error in a signal.                                | Same as the control, and the `ErrorHandler` records 1 error.   | `@error` never renders, the child stays in the DOM and is never destroyed, and `NG0600` is thrown from the `ErrorHandler`. |

## Files

| File                        | Purpose                                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/throwing-child.ts` | The child whose template throws. Its `ngOnDestroy` records that it was destroyed.                                                                                     |
| `src/app/scenarios/*.ts`    | One component per scenario.                                                                                                                                           |
| `src/app/app.routes.ts`     | Routes. The bug 2 `ErrorHandler` is provided on its route only, so it does not affect the other scenarios. Providing it in the application config fails the same way. |
| `src/app/boundary.spec.ts`  | Tests for all scenarios, plus the `untracked()` workaround for bug 2.                                                                                                 |

## Cause

The `ON_ERROR` handler that `ɵɵboundaryUpdate` sets on the boundary content runs inside the `catch` block of the failing view's `refreshView`, before the previous reactive consumer is restored. The handler then calls the app `ErrorHandler` and removes the boundary content immediately. A signal write in either step throws `NG0600`:

- **Bug 1:** `detachView` marks the component's view queries dirty. For a signal query, that is a signal write. Any control flow inside the boundary creates a query match, so the queried element does not need to be inside the boundary. The write throws after the view is removed from its container but before it is destroyed, so the content leaks.
- **Bug 2:** the `ErrorHandler` writes a signal.

The issue has the full analysis and a suggested fix.

## Workarounds

- Use decorator queries (`@ViewChild()`, `@ViewChildren()`) in components that declare a `@boundary`.
- Wrap signal writes in `ErrorHandler` in `untracked()`.

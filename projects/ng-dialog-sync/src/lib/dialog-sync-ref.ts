// projects/ng-dialog-sync/src/lib/dialog-sync-ref.ts
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * @description
 * An enhanced dialog reference returned by `DialogSyncService.openSyncDialog()`.
 * It extends the standard `MatDialogRef` with capabilities for two-way
 * reactive data synchronization and action triggering between the parent
 * component and the opened dialog.
 *
 * @template TInput The type of data that can be sent from the parent to the dialog.
 * @template TOutput The type of data that can be returned from the dialog to the parent upon close.
 * @template TDialogComponent The type of the dialog component instance.
 */
export class DialogSyncRef<TInput = any, TOutput = any, TDialogComponent = any> {
  /**
   * The underlying Angular Material dialog reference.
   */
  public readonly dialogRef: MatDialogRef<TDialogComponent, TOutput>;

  /**
   * An observable that emits the latest data sent from the parent to the dialog.
   * The dialog component subscribes to this to receive dynamic updates.
   */
  public readonly data$: Observable<TInput>;

  /**
   * An observable that emits named actions triggered from the parent to the dialog.
   * The dialog component subscribes to this to react to specific commands.
   */
  public readonly action$: Observable<{ action: string; payload: any }>;

  /**
   * An observable that emits the latest data sent from the dialog to the parent.
   * The parent component subscribes to this to receive dynamic updates from the dialog.
   */
  public readonly parentData$: Observable<TOutput>;

  // Internal subjects for communication, managed by the service
  private _syncDataSubject: BehaviorSubject<TInput>;
  private _actionSubject: Subject<{ action: string; payload: any }>;
  private _parentDataSubject: BehaviorSubject<TOutput | undefined>;

  constructor(
    dialogRef: MatDialogRef<TDialogComponent, TOutput>,
    syncDataSubject: BehaviorSubject<TInput>,
    actionSubject: Subject<{ action: string; payload: any }>,
    parentDataSubject: BehaviorSubject<TOutput | undefined>
  ) {
    this.dialogRef = dialogRef;
    this._syncDataSubject = syncDataSubject;
    this._actionSubject = actionSubject;
    this._parentDataSubject = parentDataSubject;

    // Expose observables for external consumption
    this.data$ = this._syncDataSubject.asObservable();
    this.action$ = this._actionSubject.asObservable();
    this.parentData$ = this._parentDataSubject.asObservable() as Observable<TOutput>;
  }

  /**
   * Provides direct access to the dialog component instance.
   * Use with caution, as direct access can bypass reactive patterns.
   * Useful for calling public methods on the dialog component.
   */
  get instance(): TDialogComponent {
    return this.dialogRef.componentInstance;
  }

  /**
   * Sends dynamic data updates from the parent to the dialog.
   * The dialog's `data$` observable will emit this new data.
   * @param data The data to send to the dialog.
   */
  sendData(data: TInput): void {
    this._syncDataSubject.next(data);
  }

  /**
   * Triggers a named action in the dialog from the parent.
   * The dialog's `action$` observable will emit this action.
   * @param action The name of the action to trigger.
   * @param payload Optional payload to send with the action.
   */
  triggerAction(action: string, payload?: any): void {
    this._actionSubject.next({ action, payload });
  }

  /**
   * Closes the dialog, optionally passing a result back to the parent.
   * This is a wrapper around `MatDialogRef.close()`.
   * @param dialogResult The result to pass back to the parent.
   */
  close(dialogResult?: TOutput): void {
    this.dialogRef.close(dialogResult);
    // Ensure subjects are completed when the dialog closes
    this._syncDataSubject.complete();
    this._actionSubject.complete();
    this._parentDataSubject.complete();
  }

  /**
   * An observable that emits when the dialog is closed.
   * This is a proxy to `MatDialogRef.afterClosed()`.
   * @returns An Observable that emits the dialog result when the dialog closes.
   */
  afterClosed(): Observable<TOutput | undefined> {
    return this.dialogRef.afterClosed();
  }

  /**
   * Sends dynamic data updates from the dialog to the parent.
   * The parent's `parentData$` observable (from the `DialogSyncRef` in the parent) will emit this new data.
   * This method is intended to be called from *inside* the dialog component.
   * @param data The data to send to the parent.
   */
  _updateParentData(data: TOutput): void {
    this._parentDataSubject.next(data);
  }
}
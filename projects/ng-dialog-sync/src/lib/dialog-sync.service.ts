// projects/ng-dialog-sync/src/lib/dialog-sync.service.ts
import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { DialogSyncRef } from './dialog-sync-ref';

/**
 * @description
 * Interface for the initial data passed to the dialog, and for dynamic updates *to* the dialog.
 * This should be extended by specific dialog input types.
 */
export interface DialogInputData<T = any> {
  // Initial data for the dialog
  initialData?: T;
  // Internal Subject for sending dynamic data updates from parent to dialog
  _syncDataSubject?: BehaviorSubject<T>;
  // Internal Subject for sending actions from parent to dialog
  _actionSubject?: Subject<{ action: string; payload: any }>;
  // Internal Subject for sending dynamic data updates from dialog to parent
  _parentDataSubject?: BehaviorSubject<any>;
}

/**
 * @description
 * Service to open Angular Material dialogs with enhanced two-way data synchronization
 * and action triggering capabilities.
 *
 * It leverages RxJS Subjects to create reactive streams between the parent component
 * and the opened dialog component, allowing for real-time updates and control.
 */
@Injectable({
  providedIn: 'root' // Make it available throughout the application
})
export class DialogSyncService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens an Angular Material dialog with enhanced two-way data synchronization capabilities.
   *
   * @param component The component type to be rendered inside the dialog.
   * @param config Optional MatDialogConfig for the dialog, extended with `syncData` for initial data.
   * @returns A DialogSyncRef instance, providing observables and methods for communication.
   *
   * @template TInput The type of data that can be sent from the parent to the dialog.
   * @template TOutput The type of data that can be returned from the dialog to the parent upon close.
   * @template TDialogComponent The type of the dialog component instance.
   */
  openSyncDialog<TInput = any, TOutput = any, TDialogComponent = any>(
    component: Type<TDialogComponent>,
    config?: MatDialogConfig & { syncData?: TInput }
  ): DialogSyncRef<TInput, TOutput, TDialogComponent> {
    // Create internal subjects for communication
    const syncDataSubject = new BehaviorSubject<TInput>(config?.syncData as TInput);
    const actionSubject = new Subject<{ action: string; payload: any }>();
    const parentDataSubject = new BehaviorSubject<TOutput | undefined>(undefined); // For dialog to parent updates

    // Prepare the data object that will be injected into the dialog component
    const dialogData: DialogInputData<TInput> = {
      initialData: config?.syncData,
      _syncDataSubject: syncDataSubject,
      _actionSubject: actionSubject,
      _parentDataSubject: parentDataSubject
    };

    // Merge the internal data with any existing data in the config
    const mergedConfig: MatDialogConfig = {
      ...config,
      data: { ...(config?.data || {}), ...dialogData }
    };

    // Open the standard Angular Material dialog
    const dialogRef: MatDialogRef<TDialogComponent, TOutput> = this.dialog.open(
      component,
      mergedConfig
    );

    // Create and return the enhanced DialogSyncRef
    return new DialogSyncRef<TInput, TOutput, TDialogComponent>(
      dialogRef,
      syncDataSubject,
      actionSubject,
      parentDataSubject
    );
  }
}
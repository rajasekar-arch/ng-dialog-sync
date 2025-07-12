// projects/ng-dialog-sync/src/lib/ng-dialog-sync.module.ts
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/**
 * @description
 * NgDialogSyncModule provides the `DialogSyncService` and necessary Angular Material modules
 * for dialog functionality. Import this module into your Angular application's root module
 * (e.g., `AppModule`) or a shared module.
 */
@NgModule({
  imports: [
    MatDialogModule // Required for MatDialog functionality
  ],
  exports: [
    // No components or directives to export from this library directly,
    // as it's primarily a service-based utility.
  ],
  providers: [
    // DialogSyncService is providedIn: 'root', so no explicit provider needed here
  ]
})
export class NgDialogSyncModule { }
// src/app/parent-component/parent.component.ts
import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { DialogSyncService, DialogSyncRef } from 'ng-dialog-sync'; // Import from your library
import { MyDialogComponent } from '../my-dialog/my-dialog.component';
import { Subscription } from 'rxjs';

// Define the types for your dialog's input and output data
interface MyDialogInput {
  message: string;
  count: number;
  status: string;
}

interface MyDialogOutput {
  finalMessage: string;
  finalCount: number;
  actionTaken: string;
}

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrl: './main-component.component.scss'
})

export class MainComponentComponent implements OnInit, OnDestroy {
  dialogRef: DialogSyncRef<MyDialogInput, MyDialogOutput, MyDialogComponent> | null = null;
  dialogResult: MyDialogOutput | null = null;
  currentDialogData: MyDialogInput = { message: 'Initial message from parent', count: 0, status: 'Active' };
  dynamicUpdateMessage: string = 'New message from parent';
  dynamicUpdateCount: number = 100;
  dialogLiveStatus: string = 'N/A'; // To display live updates from dialog

  private subscriptions = new Subscription();

  constructor(@Inject(DialogSyncService) private dialogSyncService: DialogSyncService) {}

  ngOnInit(): void {
    // Optional: You can open the dialog programmatically on init if needed
  }

  openMyDialog(): void {
    if (this.dialogRef) {
      console.warn('Dialog is already open.');
      return;
    }

    this.dialogResult = null; // Clear previous result
    this.dialogLiveStatus = 'N/A'; // Reset live status

    this.dialogRef = this.dialogSyncService.openSyncDialog<MyDialogInput, MyDialogOutput, MyDialogComponent>(
      MyDialogComponent,
      {
        width: '500px',
        data: { title: 'My Dynamic Dialog' }, // Standard MatDialog data
        syncData: { ...this.currentDialogData } // Initial sync data
      }
    );

    // Subscribe to dynamic data updates from the dialog
    this.subscriptions.add(
      this.dialogRef.parentData$.subscribe(data => {
        if (data) {
          this.dialogLiveStatus = `Live Status: ${data.finalMessage} (Count: ${data.finalCount})`;
          console.log('Parent received live data from dialog:', data);
        }
      })
    );

    // Subscribe to dialog close event
    this.subscriptions.add(
      this.dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog was closed. Result:', result);
        this.dialogResult = result || null;
        this.dialogRef = null; // Clear the reference
        this.dialogLiveStatus = 'Dialog Closed';
      })
    );
  }

  sendDynamicDataToDialog(): void {
    if (this.dialogRef) {
      this.currentDialogData.message = this.dynamicUpdateMessage;
      this.currentDialogData.count = this.dynamicUpdateCount;
      this.currentDialogData.status = 'Updated by Parent';
      this.dialogRef.sendData(this.currentDialogData);
      console.log('Parent sent dynamic data:', this.currentDialogData);
    } else {
      console.warn('Dialog is not open to send data.');
    }
  }

  triggerDialogAction(action: string): void {
    if (this.dialogRef) {
      this.dialogRef.triggerAction(action, { timestamp: new Date().toISOString() });
      console.log(`Parent triggered action: ${action}`);
    } else {
      console.warn('Dialog is not open to trigger actions.');
    }
  }

  closeDialogFromParent(): void {
    if (this.dialogRef) {
      // You can pass a final result even when closing from parent
      this.dialogRef.close({
        finalMessage: 'Closed by parent',
        finalCount: this.currentDialogData.count,
        actionTaken: 'ParentInitiatedClose'
      });
      console.log('Dialog closed by parent.');
    } else {
      console.warn('Dialog is not open to close.');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Ensure dialog is closed if component is destroyed while dialog is open
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

// src/app/my-dialog/my-dialog.component.ts
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogSyncRef } from 'ng-dialog-sync'; // Import from your library
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

// Data type for standard MatDialog data (if any)
interface MatDialogDefaultData {
  title: string;
}

@Component({
  selector: 'app-my-dialog',
  templateUrl: './my-dialog.component.html',
  styleUrls: ['./my-dialog.component.scss']
})
export class MyDialogComponent implements OnInit, OnDestroy {
  dialogTitle: string = 'Default Dialog Title';
  receivedMessage: string = '';
  currentCount: number = 0;
  currentStatus: string = '';
  lastActionTriggered: string = 'None';
  dialogInternalMessage: string = 'Hello from dialog!';

  private subscriptions = new Subscription();
  private dialogSyncRef: DialogSyncRef<MyDialogInput, MyDialogOutput, MyDialogComponent>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MatDialogDefaultData & { _syncDataSubject: any; _actionSubject: any; _parentDataSubject: any; initialData: MyDialogInput },
    public matDialogRef: MatDialogRef<MyDialogComponent, MyDialogOutput> // Keep MatDialogRef for standard close
  ) {
    // Reconstruct DialogSyncRef from injected data
    this.dialogSyncRef = new DialogSyncRef<MyDialogInput, MyDialogOutput, MyDialogComponent>(
      matDialogRef,
      data._syncDataSubject,
      data._actionSubject,
      data._parentDataSubject
    );

    this.dialogTitle = data.title || 'My Dialog';
    if (data.initialData) {
      this.receivedMessage = data.initialData.message;
      this.currentCount = data.initialData.count;
      this.currentStatus = data.initialData.status;
    }
  }

  ngOnInit(): void {
    // Subscribe to data updates from the parent
    this.subscriptions.add(
      this.dialogSyncRef.data$.subscribe(data => {
        if (data) {
          this.receivedMessage = data.message;
          this.currentCount = data.count;
          this.currentStatus = data.status;
          console.log('Dialog received dynamic data:', data);
        }
      })
    );

    // Subscribe to actions triggered from the parent
    this.subscriptions.add(
      this.dialogSyncRef.action$.subscribe(action => {
        console.log('Dialog received action:', action);
        this.lastActionTriggered = action.action;
        if (action.action === 'resetCount') {
          this.currentCount = 0;
          this.currentStatus = 'Count Reset by Parent';
          this.sendLiveUpdateToParent(); // Send update after action
        } else if (action.action === 'logStatus') {
          console.log(`Dialog Status Logged: ${this.currentStatus} (Count: ${this.currentCount})`);
        }
      })
    );

    // Send initial live update to parent
    this.sendLiveUpdateToParent();
  }

  incrementCount(): void {
    this.currentCount++;
    this.sendLiveUpdateToParent(); // Send live update to parent
  }

  decrementCount(): void {
    this.currentCount--;
    this.sendLiveUpdateToParent(); // Send live update to parent
  }

  sendLiveUpdateToParent(): void {
    // Use the internal _updateParentData method on the dialogSyncRef
    this.dialogSyncRef._updateParentData({
      finalMessage: `Dialog says: ${this.dialogInternalMessage}`,
      finalCount: this.currentCount,
      actionTaken: 'LiveUpdate'
    });
    console.log('Dialog sent live update to parent.');
  }

  closeDialog(action: string): void {
    // Use the close method from dialogSyncRef to pass the final result
    this.dialogSyncRef.close({
      finalMessage: this.receivedMessage,
      finalCount: this.currentCount,
      actionTaken: action
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
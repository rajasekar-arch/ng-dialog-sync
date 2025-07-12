# NgDialogSync

NgDialogSync is an Angular library designed to simplify and enhance two-way data synchronization and action control between a parent component and dynamically opened dialogs. It leverages Angular Material's MatDialog and RxJS to provide a reactive and type-safe communication channel, allowing for real-time updates and dynamic control over dialogs.

# Features

    1.Two-Way Data Sync: Dynamically send data from the parent to the dialog, and from the dialog back to the parent, while the dialog is open.

    2.Action Control: Trigger named actions in the dialog from the parent, and vice-versa, allowing for complex interactive workflows.

    3.Type Safety: Fully typed inputs, outputs, and dialog component instances for a robust development experience.

    4.Reactive Streams: Built on RxJS Observables for efficient and declarative data flow.

    5.Seamless Integration: Extends Angular Material's MatDialog without requiring significant changes to your existing dialog components.

# Installation

To install NgDialogSync in your Angular project, first ensure you have Angular Material installed. If not, you can add it:

`ng add @angular/material`

Then, install NgDialogSync:

`npm install ng-dialog-sync`

# How to Use

1. Import NgDialogSyncModule
   Import NgDialogSyncModule into your AppModule (or a shared module that is imported by your feature modules).

```javascript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button'; // Example Material module
import { MatDialogModule } from '@angular/material/dialog'; // Required for MatDialog

import { NgDialogSyncModule } from 'ng-dialog-sync'; // Import the library module

import { AppComponent } from './app.component';
import { ParentComponent } from './parent-component/parent.component';
import { MyDialogComponent } from './my-dialog/my-dialog.component';
import { FormsModule } from '@angular/forms'; // For ngModel in demo

@NgModule({
  declarations: [
    AppComponent,
    ParentComponent,
    MyDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule, // Don't forget MatDialogModule
    NgDialogSyncModule, // Add NgDialogSyncModule here
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```


```javascript
2. Parent Component Usage
Inject DialogSyncService into your parent component.
// src/app/parent-component/parent.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogSyncService, DialogSyncRef } from 'ng-dialog-sync';
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
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit, OnDestroy {
  dialogRef: DialogSyncRef<MyDialogInput, MyDialogOutput, MyDialogComponent> | null = null;
  dialogResult: MyDialogOutput | null = null;
  currentDialogData: MyDialogInput = { message: 'Initial message from parent', count: 0, status: 'Active' };
  dynamicUpdateMessage: string = 'New message from parent';
  dynamicUpdateCount: number = 100;
  dialogLiveStatus: string = 'N/A'; // To display live updates from dialog

  private subscriptions = new Subscription();

  constructor(private dialogSyncService: DialogSyncService) {}

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
```


```html
<div class="parent-container">
  <h2>Parent Component</h2>

  <div class="button-group">
    <button mat-raised-button color="primary" (click)="openMyDialog()">Open My Dialog</button>
    <button mat-raised-button color="warn" (click)="closeDialogFromParent()" [disabled]="!dialogRef">Close Dialog from Parent</button>
  </div>

  <mat-divider></mat-divider>

  <h3>Send Dynamic Data to Dialog</h3>
  <div class="input-group">
    <mat-form-field appearance="fill">
      <mat-label>Message</mat-label>
      <input matInput [(ngModel)]="dynamicUpdateMessage" />
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Count</mat-label>
      <input matInput type="number" [(ngModel)]="dynamicUpdateCount" />
    </mat-form-field>
    <button mat-raised-button color="accent" (click)="sendDynamicDataToDialog()" [disabled]="!dialogRef">Send Data</button>
  </div>

  <mat-divider></mat-divider>

  <h3>Trigger Actions in Dialog</h3>
  <div class="button-group">
    <button mat-raised-button (click)="triggerDialogAction('resetCount')" [disabled]="!dialogRef">Trigger: Reset Count</button>
    <button mat-raised-button (click)="triggerDialogAction('logStatus')" [disabled]="!dialogRef">Trigger: Log Status</button>
  </div>

  <mat-divider></mat-divider>

  <h3>Dialog Status & Results</h3>
  <p><strong>Live Status from Dialog:</strong> {{ dialogLiveStatus }}</p>
  <div *ngIf="dialogResult" class="dialog-result-box">
    <h4>Dialog Closed Result:</h4>
    <pre>{{ dialogResult | json }}</pre>
  </div>
</div>
```

```typescript
3. Dialog Component Usage
Inject MAT_DIALOG_DATA and DialogSyncRef into your dialog component.
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
  styleUrls: ['./my-dialog.component.css']
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
```


```html
<!-- src/app/my-dialog/my-dialog.component.html -->
<h2 mat-dialog-title>{{ dialogTitle }}</h2>
<mat-dialog-content>
  <p><strong>Received Message from Parent:</strong> {{ receivedMessage }}</p>
  <p><strong>Current Count:</strong> {{ currentCount }}</p>
  <p><strong>Current Status:</strong> {{ currentStatus }}</p>
  <p><strong>Last Action Triggered by Parent:</strong> {{ lastActionTriggered }}</p>

  <mat-divider></mat-divider>

  <h3>Dialog Controls</h3>
  <div class="input-group">
    <mat-form-field appearance="fill">
      <mat-label>Internal Dialog Message</mat-label>
      <input matInput [(ngModel)]="dialogInternalMessage" (input)="sendLiveUpdateToParent()" />
    </mat-form-field>
  </div>
  <div class="button-group">
    <button mat-raised-button (click)="incrementCount()">Increment Count</button>
    <button mat-raised-button (click)="decrementCount()">Decrement Count</button>
  </div>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="closeDialog('Cancel')">Cancel</button>
  <button mat-raised-button color="primary" (click)="closeDialog('Confirmed')">Confirm</button>
</mat-dialog-actions>
```

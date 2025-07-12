import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDialogSyncComponent } from './ng-dialog-sync.component';

describe('NgDialogSyncComponent', () => {
  let component: NgDialogSyncComponent;
  let fixture: ComponentFixture<NgDialogSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgDialogSyncComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgDialogSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

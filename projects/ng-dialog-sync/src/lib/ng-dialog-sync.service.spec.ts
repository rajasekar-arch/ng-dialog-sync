import { TestBed } from '@angular/core/testing';

import { NgDialogSyncService } from './ng-dialog-sync.service';

describe('NgDialogSyncService', () => {
  let service: NgDialogSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgDialogSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ProtoApiService } from './proto-api.service';

describe('ProtoApiService', () => {
  let service: ProtoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

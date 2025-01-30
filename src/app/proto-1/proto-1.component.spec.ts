import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Proto1Component } from './proto-1.component';

describe('Proto1Component', () => {
  let component: Proto1Component;
  let fixture: ComponentFixture<Proto1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [Proto1Component]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(Proto1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

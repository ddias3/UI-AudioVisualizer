import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoNoiseGateComponent } from './info-noise-gate.component';

describe('InfoNoiseGateComponent', () => {
  let component: InfoNoiseGateComponent;
  let fixture: ComponentFixture<InfoNoiseGateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoNoiseGateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoNoiseGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

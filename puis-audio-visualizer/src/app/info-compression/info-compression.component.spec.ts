import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCompressionComponent } from './info-compression.component';

describe('InfoCompressionComponent', () => {
  let component: InfoCompressionComponent;
  let fixture: ComponentFixture<InfoCompressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCompressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCompressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoEquilizerComponent } from './info-equilizer.component';

describe('InfoEquilizerComponent', () => {
  let component: InfoEquilizerComponent;
  let fixture: ComponentFixture<InfoEquilizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoEquilizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoEquilizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

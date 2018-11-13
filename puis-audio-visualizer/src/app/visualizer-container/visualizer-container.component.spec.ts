import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizerContainerComponent } from './visualizer-container.component';

describe('VisualizerContainerComponent', () => {
  let component: VisualizerContainerComponent;
  let fixture: ComponentFixture<VisualizerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

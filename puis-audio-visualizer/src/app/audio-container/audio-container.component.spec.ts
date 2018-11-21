import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioContainerComponent } from './audio-container.component';

describe('AudioContainerComponent', () => {
  let component: AudioContainerComponent;
  let fixture: ComponentFixture<AudioContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

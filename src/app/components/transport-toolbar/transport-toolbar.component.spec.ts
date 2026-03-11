import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportToolbarComponent } from './transport-toolbar.component';

describe('TransportToolbarComponent', () => {
  let component: TransportToolbarComponent;
  let fixture: ComponentFixture<TransportToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

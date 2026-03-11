import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarsSelectorComponent } from './bars-selector.component';

describe('BarsSelectorComponent', () => {
  let component: BarsSelectorComponent;
  let fixture: ComponentFixture<BarsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarsSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSelectorComponent } from './note-selector.component';

describe('NoteSelectorComponent', () => {
  let component: NoteSelectorComponent;
  let fixture: ComponentFixture<NoteSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

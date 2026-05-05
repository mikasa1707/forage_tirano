import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Travaux } from './travaux';

describe('Travaux', () => {
  let component: Travaux;
  let fixture: ComponentFixture<Travaux>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Travaux]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Travaux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

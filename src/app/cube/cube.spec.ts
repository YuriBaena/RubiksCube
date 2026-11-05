import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cube } from './cube';

describe('Cube', () => {
  let component: Cube;
  let fixture: ComponentFixture<Cube>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cube],
    }).compileComponents();

    fixture = TestBed.createComponent(Cube);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

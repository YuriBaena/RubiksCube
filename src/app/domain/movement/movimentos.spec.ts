import { TestBed } from '@angular/core/testing';
import { Movimentos } from './movimentos';

describe('Movimentos', () => {
  let service: Movimentos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Movimentos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Context } from '@oscc/types/Context';

import { ContextComponent } from './context.component';

describe('ContextComponent', () => {
  let component: ContextComponent;
  let fixture: ComponentFixture<ContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('context', new Context('', '', '', ''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

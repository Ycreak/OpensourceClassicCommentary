import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentsComponent } from './fragments.component';

describe('FragmentsComponent', () => {
  let component: FragmentsComponent;
  let fixture: ComponentFixture<FragmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FragmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FragmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  let fragment_lst = [
    {name:'1',status:'Adespoton'},
    {name:'1',status:'Certum'},
    {name:'1',status:'Incertum'}
  ]


  // sort_fragments_on_status


});

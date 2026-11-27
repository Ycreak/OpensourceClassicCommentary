import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ColumnsComponent } from './columns.component';
import { ColumnsService } from './services/columns.service';
import { Column } from '@oscc/types/Column';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ColumnsComponent with query parameters', () => {
  let columns: ColumnsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                author: 'Ennius',
                title: 'Thyestes',
                editor: 'TRF',
                name: '1',
              }),
            },
          },
        },
      ],
    }).compileComponents();

    columns = TestBed.inject(ColumnsService);
    vi.spyOn(columns, 'request').mockImplementation(() => {});
    const fixture = TestBed.createComponent(ColumnsComponent);
    fixture.detectChanges();
  });

  it('should filter on the fragment name from the url and store it in the column', () => {
    expect(columns.request).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'Ennius',
        title: 'Thyestes',
        editor: 'TRF',
        name: '1',
      }),
      expect.any(Number)
    );
    expect(columns.list()[0].name).toBe('1');
  });
});

describe('ColumnsComponent column JSON', () => {
  let component: ColumnsComponent;
  let columns: ColumnsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    columns = TestBed.inject(ColumnsService);
    vi.spyOn(columns, 'request').mockImplementation(() => {});
    const fixture = TestBed.createComponent(ColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).showSaveFilePicker;
  });

  it('should save every fragment and testimonium through the file picker', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const create_writable = vi.fn().mockResolvedValue({ write, close });
    const picker = vi.fn().mockResolvedValue({ createWritable: create_writable });
    (window as any).showSaveFilePicker = picker;
    const column = new Column({
      documents: [
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '1', document_type: 'fragment' },
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '2', document_type: 'fragment' },
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: 'T1', document_type: 'testimonium' },
        { author: '', title: '', editor: '', name: '', document_type: 'context' },
      ],
    });

    await (component as any).save_column(column);

    expect(picker).toHaveBeenCalledWith();
    expect(close).toHaveBeenCalled();
    expect(JSON.parse(await (write.mock.calls[0][0] as Blob).text())).toEqual([
      { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '1', document_type: 'fragment' },
      { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '2', document_type: 'fragment' },
      { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: 'T1', document_type: 'testimonium' },
    ]);
  });

  it('should load saved fragments and testimonia as a new column named after the file', async () => {
    const request_filters = vi.spyOn(columns, 'request_filters').mockImplementation(() => {});
    const file = new File(
      [
        JSON.stringify([
          { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '2', document_type: 'fragment' },
          { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '3', document_type: 'fragment' },
          { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: 'T1', document_type: 'testimonium' },
        ]),
      ],
      'My Ennius Column.json',
      { type: 'application/json' }
    );
    const input = { files: [file], value: 'My Ennius Column.json' } as unknown as HTMLInputElement;

    await (component as any).load_column({ target: input } as unknown as Event);

    const loaded_column = columns.list()[columns.list().length - 1];
    expect(input.value).toBe('');
    expect(loaded_column.column_name).toBe('My Ennius Column');
    expect(loaded_column.column_name_edited).toBe(true);
    expect(loaded_column.author).toBe('Ennius');
    expect(loaded_column.title).toBe('Thyestes');
    expect(loaded_column.editor).toBe('TRF');
    expect(loaded_column.name).toBe('2');
    expect(loaded_column.document_type).toBe('fragment');
    expect(request_filters).toHaveBeenCalledWith(
      [
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '2', document_type: 'fragment' },
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '3', document_type: 'fragment' },
        { author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: 'T1', document_type: 'testimonium' },
      ],
      loaded_column.column_id
    );
  });

  it('should reject a single saved column object', async () => {
    const initial_count = columns.list().length;
    const snackbar = vi.spyOn((component as any).utility, 'open_snackbar').mockImplementation(() => {});
    const file = new File(
      [JSON.stringify({ author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '4', document_type: 'fragment' })],
      'Single Column.json',
      { type: 'application/json' }
    );
    const input = { files: [file], value: 'Single Column.json' } as unknown as HTMLInputElement;

    await (component as any).load_column({ target: input } as unknown as Event);

    expect(columns.list().length).toBe(initial_count);
    expect(snackbar).toHaveBeenCalledWith('Could not load column: invalid JSON file.');
  });

  it('should reject invalid JSON without adding a column', async () => {
    const initial_count = columns.list().length;
    const snackbar = vi.spyOn((component as any).utility, 'open_snackbar').mockImplementation(() => {});
    const file = new File(['not json'], 'column.json', { type: 'application/json' });
    const input = { files: [file], value: 'column.json' } as unknown as HTMLInputElement;

    await (component as any).load_column({ target: input } as unknown as Event);

    expect(columns.list().length).toBe(initial_count);
    expect(snackbar).toHaveBeenCalledWith('Could not load column: invalid JSON file.');
  });
});

import { TestBed } from '@angular/core/testing';

import { SandboxService } from './sandbox.service';

describe('SandboxService', () => {
  let service: SandboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SandboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('defaults', () => {
    it('exposes "admin" as the default API identity', () => {
      expect(service.get_identity()).toBe('admin');
    });

    it('exposes "main" as the default display name', () => {
      expect(service.get_name()).toBe('main');
    });
  });

  describe('activate()', () => {
    it('switches identity to the user name for the teacher role', () => {
      service.activate('alice', 'teacher');
      expect(service.get_identity()).toBe('alice');
    });

    it('exposes the teacher user name verbatim as the display name', () => {
      service.activate('alice', 'teacher');
      expect(service.get_name()).toBe('alice');
    });

    it('keeps identity on "admin" for the admin role regardless of user name', () => {
      service.activate('whoever', 'admin');
      expect(service.get_identity()).toBe('admin');
    });

    it('still rewrites the display name to "main" for the admin role', () => {
      service.activate('whoever', 'admin');
      expect(service.get_name()).toBe('main');
    });

    it('leaves identity untouched for unrecognised roles (e.g. student)', () => {
      service.activate('bob', 'student');
      expect(service.get_identity()).toBe('admin');
      expect(service.get_name()).toBe('main');
    });
  });
});

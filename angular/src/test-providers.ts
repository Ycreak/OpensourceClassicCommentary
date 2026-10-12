import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

/**
 * Providers applied to every unit test.
 *
 * Several components start an http request from ngOnInit. Without the testing
 * backend those requests resolve after the test finished and the TestBed was torn
 * down, which makes the late callback fail with NG0205 (injector already destroyed).
 */
const testProviders: (Provider | EnvironmentProviders)[] = [provideHttpClient(), provideHttpClientTesting()];

export default testProviders;

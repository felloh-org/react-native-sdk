import {
  PRODUCTION_ENV,
  STAGING_ENV,
  SANDBOX_ENV,
  DEV_ENV,
} from '../constants/environment';
import {
  PRELOAD,
  RENDERED,
  PROCESSING,
  SUCCESS,
  DECLINED,
} from '../constants/progress';

describe('environment constants', () => {
  it('has the correct production URL', () => {
    expect(PRODUCTION_ENV).toBe('https://pay.felloh.com/embed/');
  });

  it('has the correct staging URL', () => {
    expect(STAGING_ENV).toBe('https://pay.staging.felloh.com/embed/');
  });

  it('has the correct sandbox URL', () => {
    expect(SANDBOX_ENV).toBe('https://pay.sandbox.felloh.com/embed/');
  });

  it('has the correct dev URL', () => {
    expect(DEV_ENV).toBe('http://localhost:3010/embed/');
  });
});

describe('progress constants', () => {
  it('has the correct status values', () => {
    expect(PRELOAD).toBe('preload');
    expect(RENDERED).toBe('rendered');
    expect(PROCESSING).toBe('processing');
    expect(SUCCESS).toBe('success');
    expect(DECLINED).toBe('declined');
  });
});

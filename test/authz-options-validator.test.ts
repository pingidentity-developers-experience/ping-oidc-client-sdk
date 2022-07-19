import { AuthZOptionsValidator } from '../src/schemas';
import { AuthZOptions, ResponseType } from '../src/types';
import { Logger } from '../src/utilities';

describe('AuthZOptionsValidator', () => {
  it('should throw error if ClientId is not set', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '',
      RedirectUri: '',
    };

    expect(() => validator.validate(options)).toThrow('options.ClientId is required to send an authorization request');
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw error if RedirectUri is not set', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: '',
    };

    expect(() => validator.validate(options)).toThrow('options.RedirectUri is required to send an authorization request');
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it('should default to HttpMethod GET if empty', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
    };

    expect(validator.validate(options).HttpMethod).toBe('GET');
  });

  it('should pass valid HttpMethod option through', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
      HttpMethod: 'POST',
    };

    expect(validator.validate(options).HttpMethod).toBe('POST');
  });

  it('should warn user of invalid HttpMethod but revert to default (GET)', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new AuthZOptionsValidator(logger);

    const options: any = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
      HttpMethod: 'PUT',
    };

    expect(validator.validate(options).HttpMethod).toBe('GET');
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it('should default to ResponseType GET if empty', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
    };

    expect(validator.validate(options).ResponseType).toBe(ResponseType.Code);
  });

  it('should pass valid ResponseType option through', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
      ResponseType: ResponseType.Hybrid,
    };

    expect(validator.validate(options).ResponseType).toBe(ResponseType.Hybrid);
  });

  it('should warn user of invalid ResponseTypes but revert to default', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new AuthZOptionsValidator(logger);

    const options: any = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
      ResponseType: 'derp',
    };

    expect(validator.validate(options).ResponseType).toBe(ResponseType.Code);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it('should default to openid profile if not empty', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
    };

    expect(validator.validate(options).Scope).toBe('openid profile');
  });

  it('should pass Scope through if provided', () => {
    const logger = new Logger();
    const validator = new AuthZOptionsValidator(logger);

    const options: AuthZOptions = {
      ClientId: '213',
      RedirectUri: 'https://example.com',
      Scope: 'openid profile email',
    };

    expect(validator.validate(options).Scope).toBe('openid profile email');
  });
});

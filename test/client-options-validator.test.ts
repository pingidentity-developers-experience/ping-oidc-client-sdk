import { ClientOptions, ClientSecretAuthMethod, GrantType, LogLevel } from '../src/types';
import { Logger } from '../src/utilities';
import { ClientOptionsValidator } from '../src/validators';

describe('ClientOptionsValidator', () => {
  it('should pass through client id', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).clientId).toBe('abc');
  });

  it('should pass through redirectUri', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).redirectUri).toBe('https://example.com');
  });

  it('should pass through client secret', () => {
    const logger = new Logger();
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
      clientSecret: 'xyz',
    };

    expect(validator.validate(options).clientSecret).toBe('xyz');
  });

  it('should allow undefined client secret', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).clientSecret).toBeUndefined();
  });

  it('should pass through state', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
      state: 'test-state',
    };

    expect(validator.validate(options).state).toBe('test-state');
  });

  it('should allow undefined state', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).state).toBeUndefined();
  });

  it('should throw error if ClientId is not set', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '',
      redirectUri: 'https://example.com',
    };

    expect(() => validator.validate(options)).toThrow('An error occured while validating ClientOptions, see console.error messages for more information');
    expect(loggerSpy).toHaveBeenCalledWith('ClientOptionsValidator', 'options.clientId is required to send an authorization request');
  });

  it('should throw error if RedirectUri is not set', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: '',
    };

    expect(() => validator.validate(options)).toThrow('An error occured while validating ClientOptions, see console.error messages for more information');
    expect(loggerSpy).toHaveBeenCalledWith('ClientOptionsValidator', 'options.redirectUri is required to send an authorization request');
  });

  it('should default grant type to authorization code', () => {
    const logger = new Logger();

    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).grantType).toBe(GrantType.AuthorizationCode);
  });

  it('should pass through grant type', () => {
    const logger = new Logger();

    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      grantType: GrantType.Token,
    };

    expect(validator.validate(options).grantType).toBe(GrantType.Token);
  });

  it('should warn users about invalid grantType and default to authorization code', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      grantType: 'derp' as any, // users may not be using TypeScript
    };

    expect(validator.validate(options).grantType).toBe(GrantType.AuthorizationCode);
    expect(loggerSpy).toHaveBeenCalledWith('ClientOptionsValidator', "options.ResponseType contained an invalid option, valid options are 'authorization_code, token'", 'derp');
  });

  it('should default scope to openid profile', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).scope).toBe('openid profile');
  });

  it('should pass through scope', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      scope: 'openid profile email',
    };

    expect(validator.validate(options).scope).toBe('openid profile email');
  });

  it('should default to client secret auth basic', () => {
    const logger = new Logger();
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      clientSecret: 'xyz',
    };

    expect(validator.validate(options).clientSecretAuthMethod).toBe(ClientSecretAuthMethod.Basic);
  });

  it('should default pass through client secret auth', () => {
    const logger = new Logger();
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      clientSecret: 'xyz',
      clientSecretAuthMethod: ClientSecretAuthMethod.Post,
    };

    expect(validator.validate(options).clientSecretAuthMethod).toBe(ClientSecretAuthMethod.Post);
  });

  it('should warn user about invalid client secret auth method and default to basic', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: '213',
      redirectUri: 'https://example.com',
      clientSecret: 'xyz',
      clientSecretAuthMethod: 'invalid' as any,
    };

    expect(validator.validate(options).clientSecretAuthMethod).toBe(ClientSecretAuthMethod.Basic);
    expect(loggerSpy).toHaveBeenCalledWith(
      'ClientOptionsValidator',
      "options.clientSecretAuthMethod contained an invalid option, valid options are 'client_secret_basic, client_secret_post'",
      'invalid',
    );
  });

  it('should default usePkce to true', () => {
    const logger = new Logger();
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
    };

    expect(validator.validate(options).usePkce).toBe(true);
  });

  it('should pass through usePkce and warn user against using client secret in browser apps', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
      usePkce: false,
      clientSecret: 'xyz', // suppress error
    };

    expect(validator.validate(options).usePkce).toBe(false);
    expect(loggerSpy).toHaveBeenCalledWith(
      'ClientOptionsValidator',
      'It is not recommended to use code grants without PKCE in browser applications, consider using PKCE and removing the client secret from your code',
    );
  });

  it('should warn user against invalid usePkce values and revert to default', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
      usePkce: 'YES' as any, // users may not be using TypeScript
    };

    expect(validator.validate(options).usePkce).toBe(true);
    expect(loggerSpy).toHaveBeenCalledWith('ClientOptionsValidator', 'options.usePkce contains an invalid value, expecting a boolean, defaulting to true', 'YES');
  });

  it('should throw error if usePkce is false and no client secret is passed', () => {
    const logger = new Logger(LogLevel.Error);
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
      usePkce: false,
    };

    expect(() => validator.validate(options).usePkce).toThrow('You are trying to authenticate using a code without PKCE but did not provide a clientSecret, you will not be able to get a token');
  });

  it('should warn user about passing in a client secret auth method but no client secret', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
      clientSecretAuthMethod: ClientSecretAuthMethod.Basic,
    };

    validator.validate(options);
    expect(loggerSpy).toHaveBeenCalledWith('ClientOptionsValidator', 'You passed a clientSecretAuthMethod but no client secret, it will be ignored');
  });

  it('should warn user about using pkce and client secret auth', () => {
    const logger = new Logger();
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const validator = new ClientOptionsValidator(logger);

    const options: ClientOptions = {
      clientId: 'abc123',
      redirectUri: 'https://example.com',
      clientSecretAuthMethod: ClientSecretAuthMethod.Basic,
      clientSecret: 'xyz',
      usePkce: true,
    };

    validator.validate(options);
    expect(loggerSpy).toHaveBeenCalledWith(
      'ClientOptionsValidator',
      'You have passed a clientSecret and/or clientSecretAuthMethod but are also using PKCE, it is not recommended to use client secret authentication and PKCE',
    );
  });
});

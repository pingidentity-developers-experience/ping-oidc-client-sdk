import { ClientStorage } from '../src/utilities';

describe('ClientStorage', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
    global.Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'oidc-client:response') {
        return 'eyJhY2Nlc3NfdG9rZW4iOiJ0b2tlbiIsImV4cGlyZXNfaW4iOjM2MDAsInNjb3BlIjoicHJvZmlsZSIsInRva2VuX3R5cGUiOiJzb21lIHR5cGUifQ==';
      }
      if (key === 'oidc-client:code_verifier') {
        return 'YWJjMTIzNDU2';
      }
      return '';
    });
    global.Storage.prototype.removeItem = jest.fn((key) => {
      delete mockStorage[key];
    });
    global.Storage.prototype.clear = jest.fn(() => {
      mockStorage = {};
    });
  });

  afterEach(() => {
    global.Storage.prototype.setItem.mockReset();
    global.Storage.prototype.getItem.mockReset();
    global.Storage.prototype.removeItem.mockReset();
  });

  it('should store token base64 encoded', () => {
    const clientStorage = new ClientStorage();
    clientStorage.storeToken({
      access_token: 'token',
      expires_in: 3600,
      scope: 'profile',
      token_type: 'some type',
    });

    expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
      'oidc-client:response',
      'eyJhY2Nlc3NfdG9rZW4iOiJ0b2tlbiIsImV4cGlyZXNfaW4iOjM2MDAsInNjb3BlIjoicHJvZmlsZSIsInRva2VuX3R5cGUiOiJzb21lIHR5cGUifQ==',
    );
  });

  it('should retrieve and decode token', () => {
    const clientStorage = new ClientStorage();
    const token = clientStorage.getToken();

    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith('oidc-client:response');

    expect(token.access_token).toBe('token');
    expect(token.expires_in).toBe(3600);
    expect(token.scope).toBe('profile');
    expect(token.token_type).toBe('some type');
  });

  it('should remove token from localStorage', () => {
    const clientStorage = new ClientStorage();
    clientStorage.removeToken();

    expect(global.Storage.prototype.removeItem).toHaveBeenCalledWith('oidc-client:response');
  });

  it('should store code verifier base64 encoded', () => {
    const clientStorage = new ClientStorage();
    clientStorage.storeCodeVerifier('abc123456');

    expect(global.Storage.prototype.setItem).toHaveBeenCalledWith('oidc-client:code_verifier', 'YWJjMTIzNDU2');
  });

  it('should retrieve and decode code verifier', () => {
    const clientStorage = new ClientStorage();
    const codeVerifier = clientStorage.getCodeVerifier();

    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith('oidc-client:code_verifier');

    expect(codeVerifier).toBe('abc123456');
  });

  it('should remove token from localStorage', () => {
    const clientStorage = new ClientStorage();
    clientStorage.removeCodeVerifier();

    expect(global.Storage.prototype.removeItem).toHaveBeenCalledWith('oidc-client:code_verifier');
  });

  it('should clear storage', () => {
    const clientStorage = new ClientStorage();
    clientStorage.clearAll();

    expect(global.Storage.prototype.clear).toHaveBeenCalled();
  });
});

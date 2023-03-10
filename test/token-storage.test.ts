import { TokenStorage } from '../src/utilities';

describe('TokenStorage', () => {
  let mockStorage: any = {};

  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
    global.Storage.prototype.getItem = jest.fn(() => 'eyJhY2Nlc3NfdG9rZW4iOiJ0b2tlbiIsImV4cGlyZXNfaW4iOjM2MDAsInNjb3BlIjoicHJvZmlsZSIsInRva2VuX3R5cGUiOiJzb21lIHR5cGUifQ==');
  });

  beforeEach(() => {
    mockStorage = {};
  });

  afterAll(() => {
    (global.Storage.prototype.setItem as any).mockReset();
    (global.Storage.prototype.getItem as any).mockReset();
  });

  it('should store token base64 encoded', () => {
    const tokenStorage = new TokenStorage();
    tokenStorage.storeToken({
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

  it('should retreive and decode token', () => {
    const tokenStorage = new TokenStorage();
    const token = tokenStorage.getToken();

    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith('oidc-client:response');

    expect(token.access_token).toBe('token');
    expect(token.expires_in).toBe(3600);
    expect(token.scope).toBe('profile');
    expect(token.token_type).toBe('some type');
  });
});

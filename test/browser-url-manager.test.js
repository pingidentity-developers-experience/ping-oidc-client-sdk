/* eslint-disable no-undef */
import { BrowserUrlManager, Logger } from '../src/utilities';

describe('BrowserUrlManager', () => {
  function setupLocation() {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=eysometoken&expires_in=1500&scope=openid+profile&token_type=access_token&id_token=eysomeidtoken',
        search: 'code=abc-123&test=param',
        assign: jest.fn(),
      },
    });
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should automatically set up empty hash parameters', () => {
      const manager = new BrowserUrlManager(new Logger());

      expect(manager.hashParams.entries()).toMatchObject({});
    });

    it('should automatically set up hash parameters object', () => {
      setupLocation();

      const mananger = new BrowserUrlManager(new Logger());

      expect(Object.fromEntries(mananger.hashParams.entries())).toMatchObject({
        access_token: 'eysometoken',
        expires_in: '1500',
        scope: 'openid profile',
        token_type: 'access_token',
        id_token: 'eysomeidtoken',
      });
    });

    it('should automatically set up empty search parameters', () => {
      const manager = new BrowserUrlManager(new Logger());

      expect(manager.searchParams.entries()).toMatchObject({});
    });

    it('should automatically set up search parameters object', () => {
      setupLocation();

      const mananger = new BrowserUrlManager(new Logger());

      expect(Object.fromEntries(mananger.searchParams.entries())).toMatchObject({ code: 'abc-123' });
    });
  });

  describe('tokenReady', () => {
    it('should be false if there is no code or access token in url', () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.hashParams = new URLSearchParams();
      manager.searchParams = new URLSearchParams();

      expect(manager.tokenReady).toBe(false);
    });

    it('should be true if there is a code in the url', () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.hashParams = new URLSearchParams();

      expect(manager.tokenReady).toBe(true);
    });

    it('should be true if there is an access token in the url', () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.searchParams = new URLSearchParams();

      expect(manager.tokenReady).toBe(true);
    });
  });

  describe('checkUrlForCode', () => {
    it('should return empty string if no code in the url', () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.searchParams = new URLSearchParams();

      expect(manager.checkUrlForCode()).toBe('');
    });

    it('should return a code if one is in the url', () => {
      const manager = new BrowserUrlManager(new Logger());

      expect(manager.checkUrlForCode()).toBe('abc-123');
    });

    it('should remove code from url and history', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementationOnce(() => {});
      const manager = new BrowserUrlManager(new Logger());

      manager.checkUrlForCode();
      expect(replaceStateSpy).toHaveBeenCalledWith(null, null, 'undefined?test=param#access_token=eysometoken&expires_in=1500&scope=openid+profile&token_type=access_token&id_token=eysomeidtoken');
    });
  });

  describe('checkUrlForToken', () => {
    it(`should return null if hash params doesn't have an access token`, () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.hashParams = new URLSearchParams();

      expect(manager.checkUrlForToken()).toBe(null);
    });

    it('should return token if has params has an access token', () => {
      const manager = new BrowserUrlManager(new Logger());
      manager.searchParams = new URLSearchParams();

      expect(manager.checkUrlForToken()).toMatchObject({
        access_token: 'eysometoken',
        expires_in: 1500,
        scope: 'openid profile',
        token_type: 'access_token',
        id_token: 'eysomeidtoken',
      });
    });

    it('should remove token for url hash and history', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementationOnce(() => {});
      const manager = new BrowserUrlManager(new Logger());

      manager.checkUrlForToken();
      expect(replaceStateSpy).toHaveBeenCalledWith(null, null, 'undefined?code=abc-123&test=param');
    });
  });

  describe('navigate', () => {
    it('should call window.location.assign', () => {
      setupLocation();
      const manager = new BrowserUrlManager(new Logger());
      const assignSpy = jest.spyOn(window.location, 'assign');

      manager.navigate('https://google.com');

      expect(assignSpy).toHaveBeenCalledWith('https://google.com');
    });
  });
});

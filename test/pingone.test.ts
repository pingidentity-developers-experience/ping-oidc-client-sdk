import PingOneOidc from '../src/pingone';

describe('pingone', () => {
  describe('authorize', () => {
    it('should set a default auth path if one is not sent', () => {
      const p1 = new PingOneOidc({ PingOneAuthPath: '', PingOneEnvId: '123' });
      expect(p1['pingOneAuthPath']).toBe('https://auth.pingone.com');
    });
  });
});

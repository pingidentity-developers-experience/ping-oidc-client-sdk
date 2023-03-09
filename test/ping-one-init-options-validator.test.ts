// import { Logger } from '../src/utilities';
// import { PingOneInitOptionsValidator } from '../src/validators';

describe('ClientOptionsValidator', () => {
  it('should blah', () => {
    expect(true).toBe(true);
  });
});

// describe('InitOptionsValidator', () => {
//   it('should pass custom auth domain without env id error', () => {
//     const logger = new Logger();
//     const options = new PingOneInitOptionsValidator(logger).validate({ PingOneEnvId: '123', PingOneAuthPath: '' });

//     expect(options.PingOneEnvId).toBe('123');
//     expect(options.PingOneAuthPath).toBe('');
//   });

//   it('should pass env id without custom domain without an error', () => {
//     const logger = new Logger();
//     const options = new PingOneInitOptionsValidator(logger).validate({ PingOneEnvId: '', PingOneAuthPath: 'https://auth.example.com' });

//     expect(options.PingOneEnvId).toBe('');
//     expect(options.PingOneAuthPath).toBe('https://auth.example.com');
//   });

//   it('should throw error if pingOneEnvId is not passed when using default auth path', () => {
//     const logger = new Logger();
//     const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

//     const fn = () => new PingOneInitOptionsValidator(logger).validate({ PingOneEnvId: '', PingOneAuthPath: '' });

//     expect(fn).toThrow('An error occured while validating AuthZOptions, see console.error messages for more information');
//     expect(loggerSpy).toHaveBeenCalledWith('PingOneInitOptionsValidator', 'You must provide a PingOneEnvId through the constructor to authorize when using the default PingOne auth path');
//   });

//   it('should warn about invalid logging options', () => {
//     // TODO - implement
//   });
// });

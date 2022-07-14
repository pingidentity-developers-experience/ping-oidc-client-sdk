import { LogLevel } from '../src/types';
import { Logger } from '../src/utilities';

describe('Logger', () => {
  afterEach(() => {
    // Reset spys
    jest.clearAllMocks();
  });

  it('should initialize with LogLevel warning by default', () => {
    const logger = new Logger();
    expect(logger['logLevel']).toBe(LogLevel.Warning);
  });

  it('should initialize with correct LogLevel', () => {
    const logger = new Logger(LogLevel.Info);
    expect(logger['logLevel']).toBe(LogLevel.Info);
  });

  describe('error', () => {
    it('should log error regardless of LogLevel', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      let logger = new Logger(LogLevel.Info);

      logger.error('logger.test.ts', 'test error');
      expect(errorSpy).toHaveBeenCalledTimes(1);

      logger = new Logger();
      logger.error('logger.test.ts', 'test error 2');
      expect(errorSpy).toHaveBeenCalledTimes(2);
    });

    it('should log additional error data if provided', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const logger = new Logger(LogLevel.Error);
      const data = {};

      logger.error('logger.test.ts', 'test error');
      logger.error('logger.test.ts', 'test error 2', data);

      expect(errorSpy).toHaveBeenNthCalledWith(1, 'logger.test.ts', 'test error');
      expect(errorSpy).toHaveBeenNthCalledWith(2, 'logger.test.ts', 'test error 2', data);
    });
  });

  describe('warn', () => {
    it('should log warning if LogLevel is warning, info or debug', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      let logger = new Logger(LogLevel.Error);

      logger.warn('logger.test.ts', 'test warning');
      expect(warnSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Warning);
      logger.warn('logger.test.ts', 'test warning');
      expect(warnSpy).toHaveBeenCalledTimes(1);

      logger = new Logger(LogLevel.Info);
      logger.warn('logger.test.ts', 'test warning 2');
      expect(warnSpy).toHaveBeenCalledTimes(2);

      logger = new Logger(LogLevel.Debug);
      logger.warn('logger.test.ts', 'test warning 3');
      expect(warnSpy).toHaveBeenCalledTimes(3);
    });

    it('should log additional warning data if provided', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const logger = new Logger(LogLevel.Warning);
      const data = {};

      logger.warn('logger.test.ts', 'test warn');
      logger.warn('logger.test.ts', 'test warn 2', data);

      expect(warnSpy).toHaveBeenNthCalledWith(1, 'logger.test.ts', 'test warn');
      expect(warnSpy).toHaveBeenNthCalledWith(2, 'logger.test.ts', 'test warn 2', data);
    });
  });

  describe('info', () => {
    it('should log info if LogLevel is info or debug', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      let logger = new Logger(LogLevel.Error);

      logger.info('logger.test.ts', 'test info');
      expect(infoSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Warning);
      logger.info('logger.test.ts', 'test info');
      expect(infoSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Info);
      logger.info('logger.test.ts', 'test info 2');
      expect(infoSpy).toHaveBeenCalledTimes(1);

      logger = new Logger(LogLevel.Debug);
      logger.info('logger.test.ts', 'test info 3');
      expect(infoSpy).toHaveBeenCalledTimes(2);
    });

    it('should log additional info data if provided', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger(LogLevel.Info);
      const data = {};

      logger.info('logger.test.ts', 'test info');
      logger.info('logger.test.ts', 'test info 2', data);

      expect(infoSpy).toHaveBeenNthCalledWith(1, 'logger.test.ts', 'test info');
      expect(infoSpy).toHaveBeenNthCalledWith(2, 'logger.test.ts', 'test info 2', data);
    });
  });

  describe('debug', () => {
    it('should log debug if LogLevel is debug', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      let logger = new Logger(LogLevel.Error);

      logger.debug('logger.test.ts', 'test warning');
      expect(debugSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Warning);
      logger.debug('logger.test.ts', 'test warning');
      expect(debugSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Info);
      logger.debug('logger.test.ts', 'test warning 2');
      expect(debugSpy).not.toHaveBeenCalled();

      logger = new Logger(LogLevel.Debug);
      logger.debug('logger.test.ts', 'test warning 3');
      expect(debugSpy).toHaveBeenCalledTimes(1);
    });

    it('should log additional debug data if provided', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = new Logger(LogLevel.Debug);
      const data = {};

      logger.debug('logger.test.ts', 'test debug');
      logger.debug('logger.test.ts', 'test debug 2', data);

      expect(debugSpy).toHaveBeenNthCalledWith(1, 'logger.test.ts', 'test debug');
      expect(debugSpy).toHaveBeenNthCalledWith(2, 'logger.test.ts', 'test debug 2', data);
    });
  });
});

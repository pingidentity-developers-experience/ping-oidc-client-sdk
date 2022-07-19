import LogLevel from './log-level';

export interface AsInitOptions {
  /** PingFederate base path */
  BasePath: string;

  /** Optional - Level will be set to warning by default */
  LoggingLevel?: LogLevel;
}

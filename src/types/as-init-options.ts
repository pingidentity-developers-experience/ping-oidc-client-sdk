import LogLevel from './log-level';

export interface AsInitOptions {
  /** PingFederate base path */
  BasePath: string;

  /** oAuth client id */
  ClientID: string;

  /** */
  RedirectURI: string;

  /** Optional - Level will be set to warning by default */
  LoggingLevel?: LogLevel;
}

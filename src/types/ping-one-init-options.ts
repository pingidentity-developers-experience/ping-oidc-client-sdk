import LogLevel from './log-level';

export interface PingOneInitOptions {
  /** Required - your PingOne environment ID */
  PingOneEnvId: string;

  /** Optional - Default value will be https://auth.pingone.com if not provided */
  PingOneAuthPath?: string;

  /** Optional - Level will be set to warning by default */
  LoggingLevel?: LogLevel;
}

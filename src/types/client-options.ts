import ClientAuthMethod from './client-secret-auth-method';
import GrantType from './grant-type';
import LogLevel from './log-level';
import { TokenResponse } from './token-response';

export interface ClientOptions {
  /** Required - client id to authorize */
  clientId: string;

  /** Required - redirect URI once request completes */
  redirectUri: string;

  /** Optional - will default to 'authorization_code', either authorization_code or token */
  grantType?: GrantType;

  /** Optional - will default to true */
  usePkce?: boolean;

  /** Optional - NOT RECOMMENDED FOR FRONT END APPS, required when not using PCKE */
  clientSecret?: string;

  /** Optional - Token Endpoint Authentication method, default is basic if GrantType is Code and PCKE is false */
  clientSecretAuthMethod?: ClientAuthMethod;

  /** Optional - will default to 'openid profile' */
  scope?: string;

  /** Optional - state passed in request, a default will be used if not provided */
  state?: string | any;

  /** Optional - default is 'warn' */
  logLevel?: LogLevel;

  /** Optional - callback that will be triggered when a token is available in the library */
  tokenAvailableCallback?: (token: TokenResponse, state?: string | any) => void;
}

import GrantType from './grant-type';

export interface TokenOptions {
  /** Required - Authorization code returned from the auth server */
  Code: string;

  /** Required - URL used as the return entry point of the application */
  RedirectUri: string;

  /** Required - Client Id to be used in the Authorization header */
  ClientId: string;

  /** Required - Client Secret to be used in the Authorization header */
  ClientSecret: string;

  /** Optional - will default to 'authorization_code' if not provided */
  GrantType: GrantType;
}

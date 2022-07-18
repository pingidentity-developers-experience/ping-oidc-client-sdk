import ResponseType from './response-type';

export interface AuthZOptions {
  /** Required - client id to authorize */
  ClientId: string;

  /** Required -  */
  RedirectUri: string;

  /** Optional - will default to 'openid profile' */
  Scope: string;

  /** Optional - will default to code if not provided, valid options are 'code', 'token' or 'code token' */
  ResponseType?: ResponseType;

  /** Optional - will default to GET if not provided, valid options are 'GET' or 'POST' */
  HttpMethod?: 'GET' | 'POST';

  /** Optional - nonce token to prevent replay attacks */
  Nonce?: string;

  /** Optional - defaults to false, For a Proof Key for Code Exchange (PKCE) authorization request,
   * the /{{envID}}/as/authorize request must include the code_challenge parameter. */
  PkceRequest?: boolean;

  /** Optional - defaults to empty, The CodeChallengeMethod property is required if the application's
   * pkceEnforcement property is set to S256_REQUIRED in PingOne. Otherwise, it is optional. */
  CodeChallengeMethod?: '' | 'S256';
}

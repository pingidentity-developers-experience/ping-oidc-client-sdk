export interface AuthZOptions {
  ClientId: string;
  RedirectUri: string;
  Scope: string;

  ResponseType?: 'code' | 'implicit' | 'hybrid';
  HttpMethod?: 'GET' | 'POST';
  Nonce?: string;
}

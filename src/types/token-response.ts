export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  scope: string;
  token_type: string;
  refresh_token?: string;
  // State that came back from auth server when redirected back to the app
  state?: string | any;
}

export interface OpenIdConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint: string;
  introspection_endpoint: string;
  revocation_endpoint: string;
  claims_parameter_supported: boolean;
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  userinfo_signing_alg_values_supported: string[];
  request_object_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claim_types_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
}

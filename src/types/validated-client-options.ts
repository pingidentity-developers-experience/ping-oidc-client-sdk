import { ClientOptions } from './client-options';
import ResponseType from './response-type';

/**
 * Interface for ClientOptions after defaults have been applied
 */
export interface ValidatedClientOptions extends ClientOptions {
  response_type: ResponseType;
  usePkce: boolean;
  scope: string;
  redirect_uri: string;
  client_id: string;
}

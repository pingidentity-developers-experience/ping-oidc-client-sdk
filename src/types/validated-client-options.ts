import { ClientOptions } from './client-options';
import GrantType from './grant-type';

/**
 * Interface for ClientOptions after defaults have been applied
 */
export interface ValidatedClientOptions extends ClientOptions {
  grantType: GrantType;
  usePkce: boolean;
  scope: string;
}

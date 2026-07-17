export type ConnectSubject =
  | { type: 'app' }
  | { type: 'user'; id: string; issuer?: string }
  | { type: 'jwt-bearer'; sub: string; iss?: string; aud?: string };

export interface ConnectTokenRequest {
  connectorUid: string;
  subject: ConnectSubject;
  scopes?: string[];
  resources?: string[];
  installationId?: string;
  validityBufferMs?: number;
}

export interface ConnectTokenResponse {
  token: string;
  expiresAt: number;
  connector: { uid: string; type: string; name?: string };
  installationId?: string;
  tenantId?: string;
}

export type ConnectorType = 'slack' | 'github' | 'oauth' | 'api-key' | 'custom';

export interface ConnectorConfig {
  uid: string;
  type: ConnectorType;
  name: string;
  icon?: string;
  service?: string;
  auth: OAuthConfig | ApiKeyConfig;
  installations?: Installation[];
  createdAt: number;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  redirectUri: string;
  scopes: string[];
}

export interface ApiKeyConfig {
  apiKey: string;
  baseUrl: string;
}

export interface Installation {
  id: string;
  tenantId: string;
  externalSubject?: string;
  name?: string;
  authorizedAt: number;
  metadata?: Record<string, string>;
}

export interface TriggerDestination {
  id: string;
  project: string;
  branch: string;
  path: string;
  environment: string;
}

export interface TriggerEvent {
  id: string;
  type: string;
  connectorUid: string;
  payload: unknown;
  timestamp: string;
}

export interface TokenRecord {
  id: string;
  connectorUid: string;
  subject: ConnectSubject;
  tokenHash: string;
  expiresAt: number;
  scopes: string[];
  installationId?: string;
  createdAt: number;
}

import { Flag } from '../core/flag';
import { ErrorCode } from '../core/error';

/**
 * API Contract Types
 * 
 * IMPORTANT: These types define the HTTP API boundary and are shared between:
 * - Backend route handlers (src/service/routes/)
 * - Frontend client (src/frontend/client/)
 * - Future external SDKs
 * 
 * ARCHITECTURAL DECISIONS:
 * - We use explicit shared types instead of code generation (tRPC, OpenAPI)
 * - This provides clear contracts that can evolve into SDK versioning
 * - Single deployment unit = types and API deploy together, sync is natural
 * - For templates: Copy this pattern across projects for consistency
 * 
 * MAINTENANCE:
 * - When changing these types, both backend AND frontend will break (good!)
 * - This forces deliberate API evolution and prevents drift
 * - Consider backward compatibility for breaking changes
 */

// Base API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

// Health endpoint types
export type HealthGetRequest = Record<string, never>;

export type HealthGetSuccessResponse = ApiSuccessResponse<{
  service: string;
  version: string;
  timestamp: string;
}>;

export type HealthGetErrorResponse = never; // Health endpoint shouldn't fail

export type HealthGetResponse = HealthGetSuccessResponse;

// Flag API types
// List flags
export type FlagListRequest = Record<string, never>;

export type FlagListSuccessResponse = ApiSuccessResponse<Flag[]>;

export interface FlagListErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.StorageError;
    message: string;
  };
}

export type FlagListResponse = FlagListSuccessResponse | FlagListErrorResponse;

// Create flag
export interface FlagCreateRequest {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export type FlagCreateSuccessResponse = ApiSuccessResponse<Flag>;

export interface FlagCreateErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.FlagKeyExists | ErrorCode.ValidationFailed | ErrorCode.StorageError;
    message: string;
  };
}

export type FlagCreateResponse = FlagCreateSuccessResponse | FlagCreateErrorResponse;

// Get flag by ID
export interface FlagGetRequest {
  id: string; // from path parameter
}

export type FlagGetSuccessResponse = ApiSuccessResponse<Flag>;

export interface FlagGetErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.FlagNotFound | ErrorCode.StorageError;
    message: string;
  };
}

export type FlagGetResponse = FlagGetSuccessResponse | FlagGetErrorResponse;

// Update flag
export interface FlagUpdateRequest {
  id: string; // from path parameter
  key?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
}

export type FlagUpdateSuccessResponse = ApiSuccessResponse<Flag>;

export interface FlagUpdateErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.FlagNotFound | ErrorCode.FlagKeyExists | ErrorCode.ValidationFailed | ErrorCode.StorageError;
    message: string;
  };
}

export type FlagUpdateResponse = FlagUpdateSuccessResponse | FlagUpdateErrorResponse;

// Delete flag
export interface FlagDeleteRequest {
  id: string; // from path parameter
}

export type FlagDeleteSuccessResponse = ApiSuccessResponse<null>;

export interface FlagDeleteErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.FlagNotFound | ErrorCode.StorageError;
    message: string;
  };
}

export type FlagDeleteResponse = FlagDeleteSuccessResponse | FlagDeleteErrorResponse;
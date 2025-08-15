export enum ErrorCode {
  FlagNotFound = "FLAG_NOT_FOUND",
  FlagKeyExists = "FLAG_KEY_EXISTS",
  ValidationFailed = "VALIDATION_FAILED",
  StorageError = "STORAGE_ERROR",
  InvalidRequest = "INVALID_REQUEST"
}

// Internal domain errors (with metadata for logging/debugging)
export class FlagNotFoundError extends Error {
  constructor(public flagId: string) {
    super(`Flag ${flagId} not found`);
    this.name = "FlagNotFoundError";
  }
}

export class FlagKeyExistsError extends Error {
  constructor(public key: string, public existingId: string) {
    super(`Flag with key "${key}" already exists (existing ID: ${existingId})`);
    this.name = "FlagKeyExistsError";
  }
}

export class ValidationError extends Error {
  constructor(public field: string, public reason: string) {
    super(`Validation failed for ${field}: ${reason}`);
    this.name = "ValidationError";
  }
}

export class StorageError extends Error {
  constructor(public operation: string, public cause?: Error) {
    super(`Storage operation failed: ${operation}`);
    this.name = "StorageError";
    if (cause) {
      this.cause = cause;
    }
  }
}
import { ErrorCode, FlagNotFoundError, FlagKeyExistsError, ValidationError, StorageError } from '../core/error';

// Re-export ErrorCode for service layer
export { ErrorCode };

// HTTP boundary error responses (sanitized, no internal metadata)
export class HttpErrorResponse {
  constructor(
    public status: number,
    public error: {
      code: ErrorCode;
      message: string;
    }
  ) {}

  toResponse(): Response {
    return new Response(
      JSON.stringify(this.error),
      {
        status: this.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export class HttpError {
  static BadRequest(code: ErrorCode, message: string): HttpErrorResponse {
    return new HttpErrorResponse(400, { code, message });
  }
  
  static NotFound(code: ErrorCode, message: string): HttpErrorResponse {
    return new HttpErrorResponse(404, { code, message });
  }
  
  static Conflict(code: ErrorCode, message: string): HttpErrorResponse {
    return new HttpErrorResponse(409, { code, message });
  }
  
  static InternalServerError(): HttpErrorResponse {
    return new HttpErrorResponse(500, { 
      code: ErrorCode.StorageError, 
      message: "Internal server error" 
    });
  }

  static from(error: Error): HttpErrorResponse {
    return mapToHttpError(error);
  }
}

// Mapping function at API boundary
export function mapToHttpError(error: Error): HttpErrorResponse {
  console.error("Internal error:", error);
  
  if (error instanceof FlagNotFoundError) {
    return HttpError.NotFound(ErrorCode.FlagNotFound, "Flag not found");
  }
  
  if (error instanceof FlagKeyExistsError) {
    return HttpError.Conflict(ErrorCode.FlagKeyExists, "Flag key already exists");
  }
  
  if (error instanceof ValidationError) {
    return HttpError.BadRequest(ErrorCode.ValidationFailed, error.message);
  }
  
  if (error instanceof StorageError) {
    return HttpError.InternalServerError();
  }
  
  // Default: don't leak internal details
  return HttpError.InternalServerError();
}
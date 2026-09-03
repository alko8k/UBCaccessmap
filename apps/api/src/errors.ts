export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, message, details);
}

export function unauthorized(message = "Sign in with a UBC email to continue."): HttpError {
  return new HttpError(401, message);
}

export function forbidden(message = "You do not have access to that."): HttpError {
  return new HttpError(403, message);
}

export function notFound(message = "Not found."): HttpError {
  return new HttpError(404, message);
}

export function tooManyRequests(message = "Please wait before trying again."): HttpError {
  return new HttpError(429, message);
}

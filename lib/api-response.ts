import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export function success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return success(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        details,
      },
    },
    { status: 400 }
  );
}

export function validationError(err: ZodError): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    },
    { status: 400 }
  );
}

export function unauthorized(message = 'Authentication required'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
    },
    { status: 401 }
  );
}

export function forbidden(message = 'Access denied'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
    },
    { status: 403 }
  );
}

export function notFound(resource = 'Resource'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
      },
    },
    { status: 404 }
  );
}

export function conflict(message: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
      },
    },
    { status: 409 }
  );
}

export function tooManyRequests(message = 'Rate limit exceeded', retryAfter?: number): NextResponse {
  const headers = retryAfter ? { 'Retry-After': String(retryAfter) } : undefined;
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message,
        details: retryAfter ? { retryAfter } : undefined,
      },
    },
    { status: 429, headers }
  );
}

export function serverError(message = 'Internal server error'): NextResponse<ApiResponse> {
  console.error('[Server Error]', message);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    { status: 500 }
  );
}

export function serviceUnavailable(message = 'Service temporarily unavailable'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message,
      },
    },
    { status: 503 }
  );
}

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: NextResponse<ApiResponse> } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

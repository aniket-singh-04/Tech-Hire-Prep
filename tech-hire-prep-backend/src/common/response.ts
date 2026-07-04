import { Response } from "express";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json(payload);
};

/* -------------------------------------------------------------------------- */
/*                                 SUCCESS                                    */
/* -------------------------------------------------------------------------- */

export const ok = <T>(
  res: Response,
  data?: T,
  message = "Success",
): Response<ApiResponse<T>> => {
  return sendResponse(res, 200, {
    success: true,
    message,
    data,
  });
};

export const created = <T>(
  res: Response,
  data?: T,
  message = "Created successfully.",
): Response<ApiResponse<T>> => {
  return sendResponse(res, 201, {
    success: true,
    message,
    data,
  });
};

export const accepted = <T>(
  res: Response,
  data?: T,
  message = "Request accepted.",
): Response<ApiResponse<T>> => {
  return sendResponse(res, 202, {
    success: true,
    message,
    data,
  });
};

export const noContent = (
  res: Response,
): Response => {
  return res.status(204).send();
};

/* -------------------------------------------------------------------------- */
/*                                   ERROR                                    */
/* -------------------------------------------------------------------------- */

export const badRequest = (
  res: Response,
  message = "Bad request.",
): Response<ApiResponse> => {
  return sendResponse(res, 400, {
    success: false,
    message,
  });
};

export const unauthorized = (
  res: Response,
  message = "Unauthorized.",
): Response<ApiResponse> => {
  return sendResponse(res, 401, {
    success: false,
    message,
  });
};

export const forbidden = (
  res: Response,
  message = "Forbidden.",
): Response<ApiResponse> => {
  return sendResponse(res, 403, {
    success: false,
    message,
  });
};

export const notFound = (
  res: Response,
  message = "Resource not found.",
): Response<ApiResponse> => {
  return sendResponse(res, 404, {
    success: false,
    message,
  });
};

export const conflict = (
  res: Response,
  message = "Conflict.",
): Response<ApiResponse> => {
  return sendResponse(res, 409, {
    success: false,
    message,
  });
};

export const unprocessableEntity = (
  res: Response,
  message = "Validation failed.",
): Response<ApiResponse> => {
  return sendResponse(res, 422, {
    success: false,
    message,
  });
};

export const tooManyRequests = (
  res: Response,
  message = "Too many requests.",
): Response<ApiResponse> => {
  return sendResponse(res, 429, {
    success: false,
    message,
  });
};

export const internalServerError = (
  res: Response,
  message = "Internal server error.",
): Response<ApiResponse> => {
  return sendResponse(res, 500, {
    success: false,
    message,
  });
};
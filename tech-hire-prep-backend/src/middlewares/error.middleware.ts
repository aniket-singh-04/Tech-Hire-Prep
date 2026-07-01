import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";

const normalizeDuplicateField = (field: string) => {
    const normalizedField = field.toLowerCase();
    if (normalizedField === "email") return "Email already exists.";
    if (normalizedField === "phone") return "Phone number already exists.";
    return `${normalizedField} already exists.`;
};

const sendError = (res: Response, req: Request, statusCode: number, message: string, details?: unknown,) =>
    res.status(statusCode).json({
        success: false,
        message,
        ...(details !== undefined ? { details } : {}),
        requestId: req.requestId,
    });


export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return sendError(res, req, err.statusCode, err.message, err.details);
    }

    const maybeMongoError = err as Error & {
        code?: number;
        keyPattern?: Record<string, number>;
        keyValue?: Record<string, unknown>;
        errors?: Record<string, { message?: string }>;
        path?: string;
        issues?: Array<{ path?: Array<string | number>; message?: string }>;
    };

    if (maybeMongoError.code === 11000) {
        const field =
            Object.keys(maybeMongoError.keyPattern ?? maybeMongoError.keyValue ?? {})[0] ?? "Field";
        return sendError(res, req, 400, normalizeDuplicateField(field));
    }

    if (err.name === "ValidationError" && maybeMongoError.errors) {
        const firstMessage = Object.values(maybeMongoError.errors)[0]?.message;
        return sendError(res, req, 400, firstMessage ?? "Validation failed.");
    }

    if (err.name === "CastError" && maybeMongoError.path) {
        return sendError(res, req, 400, `Invalid ${maybeMongoError.path}.`);
    }

    if (err.name === "ZodError" && maybeMongoError.issues?.length) {
        const fieldErrors = maybeMongoError.issues
            .filter((issue) => (issue.path?.length ?? 0) > 0)
            .map((issue) => ({
                field: issue.path?.join(".") ?? "body",
                message: issue.message ?? "Validation failed.",
            }));
        const formErrors = maybeMongoError.issues
            .filter((issue) => !issue.path?.length)
            .map((issue) => issue.message ?? "Validation failed.");

        return sendError(
            res,
            req,
            400,
            formErrors[0] ?? fieldErrors[0]?.message ?? "Validation failed.",
            {
                formErrors,
                fieldErrors,
            },
        );
    }

    if (
        err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError" ||
        err.name === "NotBeforeError"
    ) {
        return sendError(
            res,
            req,
            401,
            err.name === "TokenExpiredError" ? "Session expired" : "Unauthorized",
        );
    }
    if (process.env.NODE_ENV !== "production") {
        console.error(`[${req.requestId ?? "n/a"}] Unhandled:`, err);
    } else {
        console.error(`[${req.requestId ?? "n/a"}] Unhandled: ${err.name}: ${err.message}`);
    }
    const lowerCaseMessage =
        typeof err?.message === "string" ? err.message.toLowerCase() : "";
    if (
        lowerCaseMessage.includes("smtp") ||
        lowerCaseMessage.includes("nodemailer") ||
        lowerCaseMessage.includes("mail")
    ) {
        console.error(`[${req.requestId ?? "n/a"}] Mail error:`, err);
        return sendError(
            res,
            req,
            502,
            "We could not send the verification email. Please try again.",
        );
    }

    if (
        lowerCaseMessage.includes("s3") ||
        lowerCaseMessage.includes("aws") ||
        lowerCaseMessage.includes("signaturedoesnotmatch")
    ) {
        console.error(`[${req.requestId ?? "n/a"}] Storage error:`, err);
        return sendError(
            res,
            req,
            502,
            "Storage is temporarily unavailable. Please try again.",
        );
    }

    console.error(`[${req.requestId ?? "n/a"}] UNEXPECTED ERROR:`, err);

    return sendError(
        res,
        req,
        500,
        "Something went wrong on our side. Please try again.",
    );
}
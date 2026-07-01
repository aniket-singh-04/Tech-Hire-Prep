import type { NextFunction, Request, RequestHandler, Response } from "express";

export interface AppRequestHandler extends RequestHandler {}; // for this we do not need to import requestHandler in the controller because we tell explicelty its types is requestHandler and it is expandable when we use reqestHandler {here} typecript knows but for clarity it need 

type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export const asyncHandler =
    (fn: AsyncRouteHandler): AppRequestHandler => // here 
        (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
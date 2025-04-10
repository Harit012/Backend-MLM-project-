import { NextFunction } from "express";

export const asyncHandler =
  (fn: any) =>
    (req: Request, res: Response, next: NextFunction): any => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
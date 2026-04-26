import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import ApiError from "../utils/api.error";
import { param } from "express-validator";

export const validateId = [param("id").isMongoId().withMessage("Invalid ID")];
export const validateAdd = [
  body("alias_id").notEmpty().withMessage("alias_id is required"),
  body("history").notEmpty().withMessage("history is required"),
];

export const isRequestValidated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      errors
        .array()
        .map((e) => e.msg)
        .join(", "),
      422,
    );
  }
  next();
};

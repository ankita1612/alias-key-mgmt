import { Request, Response, NextFunction } from "express";
import { body, validationResult, param } from "express-validator";
import ApiError from "../utils/api.error";

export const validateId = [param("id").isMongoId().withMessage("Invalid ID")];
export const validateAdd = [
  body("proxy_name").notEmpty().withMessage("Proxy name is required"),
  body("proxy_token").notEmpty().withMessage("Proxy token is required"),
  body("curl").notEmpty().withMessage("Curl is required"),
];

export const validateEdit = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("proxy_name").notEmpty().withMessage("Proxy name is required"),
  body("proxy_token").notEmpty().withMessage("Proxy token is required"),
  body("curl").notEmpty().withMessage("Curl is required"),
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

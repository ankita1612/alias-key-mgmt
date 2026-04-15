import { Request, Response, NextFunction } from "express";
import { body, validationResult,param } from "express-validator";
import ApiError from "../utils/api.error";


export const validateId = [param("id").isMongoId().withMessage("Invalid ID")];
export const validateAdd = [
  body("domine").notEmpty().withMessage("Domain is required").isString(),
  body("project_name").notEmpty().withMessage("Project name is required"),
  body("proxy_name").notEmpty().withMessage("Proxy name is required"),
  body("proxy_token").notEmpty().withMessage("Proxy token is required"),
  body("curl").notEmpty().withMessage("Curl is required"),
  body("credit").optional().isNumeric().withMessage("Credit must be a number"),
];

export const validateEdit = [
  param("id").isMongoId().withMessage("Invalid ID"),

  body("domine").optional().isString(),
  body("project_name").optional().isString(),
  body("proxy_name").optional().isString(),
  body("proxy_token").optional().isString(),
  body("curl").optional().isString(),
  body("credit").optional().isNumeric(),
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

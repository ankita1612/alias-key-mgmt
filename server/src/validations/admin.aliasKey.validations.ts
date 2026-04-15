import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import ApiError from "../utils/api.error";
import { param } from "express-validator";

export const validateId = [param("id").isMongoId().withMessage("Invalid ID")];
export const validateAdd = [
  body("domain_name").notEmpty().withMessage("Domain name is required"),

  // body("parent_key")
  //   .notEmpty()
  //   .withMessage("Parent key is required")
  //   .isMongoId()
  //   .withMessage("Invalid parent key"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending", "Rejected"])
    .withMessage("Invalid status"),

  body("total_quota").isNumeric().withMessage("Total quota must be a number"),
];
export const validateEdit = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("domain_name")
    .optional()
    .notEmpty()
    .withMessage("Domain name is required"),
  body("total_quota")
    .optional()
    .isNumeric()
    .withMessage("Total quota must be a number"),
  body("remaining_quota")
    .optional()
    .isNumeric()
    .withMessage("Remaining quota must be a number"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending", "Rejected"])
    .withMessage("Invalid status"),
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

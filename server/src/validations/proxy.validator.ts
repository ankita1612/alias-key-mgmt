import { Request, Response, NextFunction } from "express";
import { body, validationResult, param } from "express-validator";
import ApiError from "../utils/api.error";
import ProxyModel from "../models/proxy.model";
export const validateId = [param("id").isMongoId().withMessage("Invalid ID")];
export const validateAdd = [
  body("proxy_name").notEmpty().withMessage("Proxy name is required"),
  body("proxy_token").notEmpty().withMessage("Proxy token is required"),
  body("curl")
    .notEmpty()
    .bail()
    .custom(async (value) => {
      const existing = await ProxyModel.findOne({
        curl: value.trim(),
        is_deleted: false, // ✅ ignore soft deleted
      }).lean();

      if (existing) {
        throw new Error("Curl must be unique");
      }

      return true;
    }),
  body("curl_token").notEmpty().withMessage("Token variable is required"),
];

export const validateEdit = [
  param("id").isMongoId().withMessage("Invalid ID"),
  // body("proxy_name").notEmpty().withMessage("Proxy name is required"),
  // body("proxy_token").notEmpty().withMessage("Proxy token is required"),
  // body("curl").notEmpty().withMessage("Curl is required"),
  // body("curl_token").notEmpty().withMessage("Token variable is required"),
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

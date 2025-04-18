import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

type ValidationType = "string" | "number" | "boolean" | "object" | "ObjectId";

// Defines the structure for validation parameters, including potential nested parameters
export interface ValidationParam {
  name: string; // The name of the parameter to validate
  type: ValidationType; // The type of the parameter to validate with
  required?: boolean; // Whether the parameter is required
  isAllowBlank?: boolean; // Whether the parameter is allowed to be blank
  validate?:boolean; // Whether the parameter is required to be validated
  enum?: any[];
  isArray?: boolean;
  child?: ValidationParam[]; // Optional array of child parameters for nested object validation
  isParam?: boolean;
  isHeader?: boolean;
  requiredWhen?: object;
}

/**
 * Middleware for validating request bodies against a specified schema.
 * @param requiredParams - An array of parameters to validate against, including nested parameters.
 * @returns An Express middleware function that validates the request body.
 */
export const validateRequest = (requiredParams: ValidationParam[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    /**
     * Recursively validates parameters against the provided schema.
     * @param params - The current object or subset of the object being validated.
     * @param requiredParams - The schema definitions for required parameters at the current level.
     * @param parentParamPath - The dot-delimited path to the current level (for error messaging).
     * @returns true if validation passes; otherwise, false.
     */

    const isEntityWise = (obj: any): boolean => {
      // checks for null and undefined
      if (obj === null) return false;
      return typeof obj[Symbol.iterator] !== "function";
    };

    // Determine the source of parameters based on the request method
    const paramsSource = req.method === "GET" ? req.query : req.body;
    const type = req.params.type ? req.params.type : paramsSource.type;
    requiredParams = isEntityWise(requiredParams) ? (requiredParams[type] as unknown as ValidationParam[]) : requiredParams;
    if (await validate(req, res, paramsSource, requiredParams, "")) {
      next(); // If validation passes, proceed to the next middleware
    }
    // If validation fails, an error response is sent within the validate function
  };
};

const validate = async (req: Request, res: Response, params: any, requiredParams: ValidationParam[], parentParamPath: string): Promise<boolean> => {
  try {
    for (const param of requiredParams) {
      const paramPath = parentParamPath + param.name; // Construct the parameter path for error messages

      if (!(await checkAllValidation(req, res, param.isParam ? { ...params, [param.name]: req.params[param.name] } : params, param, paramPath))) {
        return false;
      }
    }
    return true; // If all validations pass, return true
  } catch (error) {
    console.error("Error validateRequest:", error);
    return false;
  }
};

const checkAllValidation = async (req: Request, res: Response, params: any, param: any, paramPath: string): Promise<boolean> => {
  try {
    if (!checkRequiredParams(params[param.name], req, res, { params, param, paramPath })) {
      return false;
    }

    if (!checkDatatype(params[param.name], res, params, param, paramPath)) {
      return false;
    }

    if (!checkExpectedValue(params[param.name], res, param, paramPath)) {
      return false;
    }

    if (!(await checkChildParams(req, res, params[param.name], param, paramPath))) {
      return false;
    }

    return await checkRegExp(params[param.name], res, param, paramPath, params);
  } catch (error) {
    console.error("Error checkAllValidation:", error);
    throw error;
  }
};

const checkRequiredParams = (value: string, req: Request, res: Response, extraParams: { params: any; param: any; paramPath: string }): boolean => {
  try {
    const { params, param, paramPath } = extraParams;
    let newValue = value;

    const sendError = (message: string): boolean => {
      res.status(400).json({ message });
      return false;
    };

    // Check for missing required parameters
    if (param.required && !(param.name in params) && !param.isParam && !param.isHeader) {
      return sendError(`Missing required parameter: ${paramPath}`);
    }

    if (param.requiredWhen) {
      // Check for missing required parameters based on other parameters
      const isInvalid = Object.entries(param.requiredWhen).every(
        ([key, values]: any) => values.includes(params[key]) && !(param.name in params) && !param.isParam && !param.isHeader
      );
      if (isInvalid) {
        return sendError(`Missing required parameter: ${paramPath}`);
      }
    }

    if (param.isHeader) {
      const headerValue = req.headers[param.name];
      if (!headerValue && param.required) {
        return sendError(`Missing required header: ${paramPath}`);
      }
      params[param.name] = headerValue;
      newValue = headerValue as string;
    }

    if (param.isParam) {
      const paramValue = req.params[param.name];
      if (!paramValue && param.required) {
        return sendError(`Missing required param: ${paramPath}`);
      }
      params[param.name] = paramValue;
      newValue = paramValue;
    }

    return checkBlankValues(newValue, res, param, paramPath);
  } catch (error) {
    console.error("Error checkRequiredParams:", error);
    throw error;
  }
};

const checkBlankValues = (value: string, res: Response, param: any, paramPath: string): boolean => {
  try {
    // Check for type mismatch (if the parameter is present)
    if (param.required && !param.isAllowBlank && typeof value === "string" && !value) {
      res.status(400).json({ message: `Expect value for parameter '${paramPath}' ` });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checkBalnkValues:", error);
    throw error;
  }
};

const checkDatatype = (value: any, res: Response, params: any, param: any, paramPath: string): boolean => {
  try {
    if (value === undefined) {
      return true;
    }

    // Specific check for ObjectId type parameters
    /*if (param.type === "ObjectId") {
      if (!mongoose.Types.ObjectId.isValid(value) && (!param.isAllowBlank || (param.isAllowBlank && value !== ""))) {
        res.status(400).json({ message: `Invalid ObjectId for parameter '${paramPath}'.` });
        return false;
      }
    } else */
    if (param.type === "ObjectId") {
      return checkObjectId(value, res, param, paramPath);
    } else if (typeof value !== param.type) {
      if (param.type === "number" && typeof value === "string" && isNumericString(value)) {
        params[param.name] = Number(value);
      } else if (param.type === "boolean" && isBooleanString(value)) {
        params[param.name] = value === "true";
      } else {
        if (param.isAllowBlank && value === "") {
          return true;
        }
        res.status(400).json({ message: `Invalid data type for parameter '${paramPath}'. Expected '${param.type}', got '${typeof value}'.` });
        return false;
      }
    }

    // Trim whitespace from string parameters
    trimString(param, params);

    return true;
  } catch (error) {
    console.error("Error checkDatatype:", error);
    throw error;
  }
};

const checkObjectId = (value: any, res: Response, param: any, paramPath: string): boolean => {
  if (!mongoose.Types.ObjectId.isValid(value) && (!param.isAllowBlank || (param.isAllowBlank && value !== "" && value !== null))) {
    res.status(400).json({ message: `Invalid ObjectId for parameter '${paramPath}'.` });
    return false;
  }
  return true;
};

const trimString = (param: any, params: any): void => {
  if (param.type === "string") {
    // Trim whitespace from string parameters
    params[param.name] = params[param.name].trim();
  }
};

const checkExpectedValue = (value: string, res: Response, param: any, paramPath: string): boolean => {
  try {
    // Enum validation (if applicable)
    if (value !== undefined && param.enum && (!param.isAllowBlank || value !== "")) {
      // Check if 'value' is an array
      if (Array.isArray(value)) {
        // Validate each element in the array
        if (!value.every((element) => param.enum?.includes(element))) {
          res.status(400).json({
            message: `Invalid value for parameter '${paramPath}'. Expected one of ${param.enum.join(", ")}, but got an array with invalid elements.`
          });
          return false;
        }
      } else if (!param.enum.includes(value)) {
        res.status(400).json({
          message: `Invalid value for parameter '${paramPath}'. Expected one of ${param.enum.join(", ")}, got '${value}'.`
        });
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checkExpectedValue:", error);
    throw error;
  }
};

const checkChildParams = async (req: Request, res: Response, value: string, param: any, paramPath: string): Promise<boolean> => {
  try {
    // If the parameter is an object with child parameters, recurse into those
    if (value !== undefined && param.type === "object" && param.child && param.child.length > 0) {
      if (param.isArray) {
        for (const detail of value) {
          if (!(await validate(req, res, detail, param.child, `${paramPath}.`))) {
            // If validation of any child parameter fails, stop further validation
            return false;
          }
        }
      } else if (!(await validate(req, res, value, param.child, `${paramPath}.`))) {
        // If validation of any child parameter fails, stop further validation
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checkChildParams:", error);
    throw error;
  }
};

const checkRegExp = async (value: string, res: Response, param: any, paramPath: string, params: any): Promise<boolean> => {
  try {
    // Validate parameters
    if (param.validate && value) {
      if (!(await testRegExp(param.name, value))) {
        res.status(400).json({ message: `RegEx failed for '${paramPath}'.` });
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checkRegExp:", error);
    throw error;
  }
};

const isBooleanString = (value: string): boolean => {
  const lowercaseValue = value.toLowerCase().trim();
  return lowercaseValue === "true" || lowercaseValue === "false";
};

const isNumericString = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

/**
 * Creates a set of validation parameters for a given route.
 * @param params - The validation parameters to create.
 * @returns The generated validation parameters.
 */
export const createValidationParams = <T extends { [key: string]: ValidationParam[] }>(params: T): T => {
  return params;
};


export const testRegExp = async (param: string, value: string): Promise<boolean> => {
  let regExpRule: string = "";

  switch (param) {
    case "password":
      // You can hardcode a password rule or define it somewhere else
      regExpRule = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"; // Example: Minimum 8 characters, at least 1 letter and 1 number
      break;

    case "email":
      regExpRule = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
      break;

    case "phone":
      regExpRule = "^[0-9]{10}$"; // Exactly 10 digits
      break;

    case "accountNumber":
      regExpRule = "^[0-9]{14}$"; // Only digits, length 14
      break;

    case "ifscCode":
      regExpRule = "^[A-Z]{4}[0-9]{7}$"; // length 11 first 4 alphabets in uppercase then 7 numeric
      break;
      
    default:
      return false;
  }

  return new RegExp(regExpRule).test(value);
};

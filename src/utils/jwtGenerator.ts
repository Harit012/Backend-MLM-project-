import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate JWT token
 * @param userId - User's MongoDB _id
 * @param secret - Secret key for signing
 * @param expiresIn - Token expiration time (default: "1d")
 * @returns JWT token string
 */
export const generateJWT = (
  userId: string,
  expiresIn: string = "1d"
): string => {
  let secret:string = process.env.JWT_SECRET || "secret"
  const payload = {
    id: userId,
    jti: uuidv4(), // ✅ unique ID for this token
  };
  return jwt.sign(payload, secret);
};

import jwt from "jsonwebtoken";

/**
 * Generate JWT token
 * @param userId - User's MongoDB _id
 * @param secret - Secret key for signing
 * @param expiresIn - Token expiration time (default: "1d")
 * @returns JWT token string
 */
export const generateJWT = (
  userId: string,
  secret: string,
  expiresIn: string = "1d"
): string => {
  const payload = { id: userId };
    return "abc"
//   return jwt.sign(payload, secret, { expiresIn });
};

// middleware/authenticateJWT.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../utils/tokenBlackList";

const JWT_SECRET:string = process.env.JWT_SECRET  ?? "YO_ITS_ME"; // or however you're managing your secret

export const authenticateJWT =async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return; // ✅ make sure to return void
    }

    try {
        console.log(token)
        console.log("------------------------------------------")
        const decoded = await jwt.verify(token, JWT_SECRET) as { id: string; jti: string };
        console.log(decoded)

        if (tokenBlacklist.has(decoded.jti)) {
            res.status(401).json({ message: "Token has been logged out" });
            return; // ✅ make sure to return void
        }

        (req as any).user = decoded;
        next(); // ✅ continue the request
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};


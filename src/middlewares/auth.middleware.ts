import { Request, Response, NextFunction } from "express";
// import { AuthService } from "../modules/auth/service/auth.service";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        // const decoded = AuthService.verifyToken(token);
        // req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

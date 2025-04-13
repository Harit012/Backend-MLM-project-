// middleware/authenticateJWT.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../utils/tokenBlackList";

const JWT_SECRET:string = process.env.JWT_SECRET  ?? "YO_ITS_ME"; // or however you're managing your secret

// export const authenticateJWT =async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const token = req.header("Authorization")?.split(" ")[1];
//     if (!token) {
//         res.status(401).json({ message: "Unauthorized" });
//         return; // ✅ make sure to return void
//     }

//     try {
//         // console.log(token)
//         // console.log('JWT_SECRET: ', JWT_SECRET);
//         console.log("------------------------------------------")
//         // const decoded = jwt.verify(token, JWT_SECRET) as { id: string; jti: string };
//         const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { id: string; jti: string };

//         // console.log(decoded)

//         if (tokenBlacklist.has(decoded.jti)) {
//             res.status(401).json({ message: "Token has been logged out" });
//             return; // ✅ make sure to return void
//         }

//         (req as any).user = decoded;
//         next(); // ✅ continue the request
//     } catch (error) {
//         console.log(error)
//         res.status(401).json({ message: "Invalid token" });
//         return;
//     }
// };

export const authenticateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      res.status(401).json({ message: 'Unauthorized token' });
      return;
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as { id: string; jti: string };
  
      // Attach the user ID to the request object
      (req as any).userId = decoded.id;
      (req as any).jti = decoded.jti;
  
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };


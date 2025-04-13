import express, { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { register, logIn  } from "../controller/login.controller";
import { AuthParams } from "../config/required.params";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { uploadImage } from "../../../middlewares/multerConfig";
import { authenticateJWT } from "../../../middlewares/auth.middleware";

const Auth: Router = express.Router();

// Auth.get("/auth/signin",asyncHandler(signIn))
Auth.post("/login",validateRequest(AuthParams.login),logIn)

Auth.post("/register",uploadImage.single("profilePhoto"),validateRequest(AuthParams.register),register)

// Auth.get("/logout",authenticateJWT,logOut)


export default Auth;
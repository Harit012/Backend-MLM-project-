import express, { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { register, logIn  } from "../controller/login.controller";
import { AuthParams } from "../config/required.params";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { uploadImage } from "../../../middlewares/multerConfig";

const Auth: Router = express.Router();

// Auth.get("/auth/signin",asyncHandler(signIn))
Auth.post("/auth/login",validateRequest(AuthParams.login),logIn)
Auth.post("/auth/register",uploadImage.single("profilePhoto"),validateRequest(AuthParams.register),register)


export default Auth;
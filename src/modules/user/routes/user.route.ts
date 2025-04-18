import express, { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { uploadImage } from "../../../middlewares/multerConfig";
import { authenticateJWT } from "../../../middlewares/auth.middleware";
import { approveUser, getAllUsers, getProfile, logOut, UpdateUserDetails } from "../controller/user.controller";
import { UserParams } from "../config/userRequired.params";
import { addBankDetails, editBankDetails } from "../controller/bankDetails.controller";
import { BankDetailParams } from "../config/bankDetailRequirment.params";

const User: Router = express.Router();

User.get('/getProfile',getProfile)

User.patch('/approve',validateRequest(UserParams.approveUserValidator),approveUser)

User.put('/update/:id',uploadImage.single("profilePhoto"),validateRequest(UserParams.updateUserDetails),UpdateUserDetails)

User.get('/getAllUsers', getAllUsers)

User.post('/addBankDetails',validateRequest(BankDetailParams.addBankDetail), addBankDetails)

User.patch('/editBankDetails',validateRequest(BankDetailParams.editBankDetail), editBankDetails)

User.get("/logout",logOut)

export default User 
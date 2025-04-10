import { Request, Response } from "express";
import { FilterQuery, Model, Types } from "mongoose";
import User, { IUser } from "../../user/model/user.model";
import path from "path";
import fs from "fs";

const { JWT_SECRET } = process.env as { JWT_SECRET: string };

export const logIn = async (req: Request, res: Response): Promise<any> => {
    const { email, phone, password } = req.body;
  
    try {
      if ((!email && !phone) || !password) {
        return res.status(400).json({
          success: false,
          message: "Email or phone and password are required",
        });
      }
  
      // Build dynamic query
      const query = email ? { email } : { phone };
      const user:any = await User.findOne(query);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // Compare password
    //   const isMatch = await bcrypt.compare(password, user.password);
      if (!(user.password === password)) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }
  
      // Optionally generate token here (JWT, etc.)
  
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
        },
      });
  
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

export const register = async (req: Request, res: Response): Promise<any> => {
    let profilePath = req.file? req.file.filename : "no-File"
    try {
      // Destructure and sanitize input
      let {
        firstName,
        lastName,
        phone,
        email,
        password,
        referalCode,
      } = req.body;
      // Normalize input
      firstName = firstName?.trim();
      lastName = lastName?.trim();
      phone = phone?.trim();
      email = email?.trim().toLowerCase();
      referalCode = referalCode?.trim().toLowerCase();
    
      // Parallel check for existing email and phone number
      const [existingEmailUser, existingPhoneUser] = await Promise.all([
        User.findOne({ email }),
        User.findOne({ phone }),
      ]);
  
      if (existingEmailUser) {
        if(profilePath != "no-File"){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
        }
        return res.status(409).send({
          success: false,
          message: "User with same email already exists",
        });
      }
  
      if (existingPhoneUser) {
        if(profilePath != "no-File"){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
        }
        return res.status(409).send({
          success: false,
          message: "User with same phone number already exists",
        });
      }
  
      // Find parent user using referral code
      const parentUser = await User.findOne({ referalCode });
      if (!parentUser) {
        if(profilePath != "no-File"){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
        }
        return res.status(404).send({
          success: false,
          message: "Referral ID not found",
        });
      }
  
      // Build the path using parent path and lowercase first name
      const path2 = `${parentUser.parentPath}/${parentUser.firstName.toLowerCase()}`;
  
      // Count number of children under this path
      const childCount = await User.countDocuments({ parentPath: path2 });
      let direction = "left"
      if (childCount >= 2) {
        if(profilePath != "no-File"){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
        }
        return res.status(409).send({
          success: false,
          message: "Referral is expired or fully used",
        });
      }else if(childCount == 0){
        direction = "right"
      }
  
      // Generate unique referral code for new user
    //   const userReferralCode = `${firstName.toLowerCase()}${Date.now()}`;
      const userReferralCode =generateReferralCode();
  
      // Create new user
      const newUser = await User.create({
        firstName,
        lastName,
        phone,
        email,
        password,
        parentPath: path2,
        referalCode: userReferralCode,
        direction,
        profilePath
      });
  
      return res.status(200).send({ success: true, data: newUser });
    } catch (error: any) {
        if(profilePath != "no-File"){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
        }
      console.error("Registration Error:", error);
      return res.status(500).send({
        success: false,
        message: "Something went wrong during registration",
        error: error.message || error,
      });
    }
  };
  
  const generateReferralCode = (length = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
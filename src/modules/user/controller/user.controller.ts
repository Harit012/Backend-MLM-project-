import { Request, Response } from "express";
import User, { IUser } from "../../user/model/user.model";
import path from "path";
import fs from "fs";
import { updateFields } from "../../../utils/updateFunc";
import { tokenBlacklist } from "../../../utils/tokenBlackList";
import UserRequest from "../../request/model/request.model";
import { RequestReasons } from "../../../utils/constants";

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  const userId = (req as any).userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    return res.status(200).send({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

// export const approveUser = async (req:Request,res:Response):Promise<any> =>{
//     try{
//         const  id  = (req as any).userId;
//         const { userId } = req.body;
//         let requester = await User.findById(id);
//         if(!requester?.isSuperUser){
//             return res.status(409).send({success:false, message:"Youe are not authorize to approve a user"})
//         }
//         let user = await User.findByIdAndUpdate(userId,{$set:{isApproved:true}},{new:true});
//         if(!user){
//             return res.status(404).send({success:false, message:"No user exist with that id"})
//         }
//         // let fullPath = user?.parentPath;
//         let parentArray:any = user?.parentPath?.split("/");
//         parentArray =parentArray?.slice(1,parentArray.length-1)
//         parentArray = parentArray?.map((ele:any)=>{
//             return Number(ele);
//         });
//         // console.log(parentArray)
//         res.send({success:true, data:parentArray})
//     }catch(err:any){
//         res.status(500).send({success:false , message: err.message });
//     }
// }

export const UpdateUserDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  let profilePath: any = null;
  if (req.file) {
    profilePath = req.file.filename;
  }
  try {
    let { id } = req.params;
    let { firstName, lastName, email, phone, isSuperUser = false } = req.body;
    firstName = firstName?.trim();
    lastName = lastName?.trim();
    phone = phone?.trim();
    email = email?.trim().toLowerCase();
    let existUser: any = await User.findById(id);
    if (!existUser) {
      return res.status(404).send({
        success: false,
        message: "User you want to update does not exist in records",
      });
    }
    if (email) {
      let usr = await User.findOne({ email });
      if (usr) {
        if (profilePath) {
          fs.unlinkSync(
            path.join(__dirname, "../../../../uploads/images", profilePath)
          );
        }
        return res.status(409).send({
          success: false,
          message: "User with same email already exists",
        });
      }
    }
    if (phone) {
      let usr = await User.findOne({ phone });
      if (usr) {
        if (profilePath) {
          fs.unlinkSync(
            path.join(__dirname, "../../../../uploads/images", profilePath)
          );
        }
        return res.status(409).send({
          success: false,
          message: "User with same Phone number already exists",
        });
      }
    }
    let update = updateFields({
      firstName,
      lastName,
      email,
      phone,
      profilePath,
      isSuperUser,
    });
    // console.log(update)
    let user = await User.findByIdAndUpdate(id, update, { new: true });
    if (
      existUser?.profilePath != "no-File" &&
      user?.profilePath != existUser?.profilePath
    ) {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../../../../uploads/images",
          existUser?.profilePath
        )
      );
    }
    return res.status(200).send({ success: true, user });
  } catch (err: any) {
    if (profilePath) {
      fs.unlinkSync(
        path.join(__dirname, "../../../../uploads/images", profilePath)
      );
    }
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = (req as any).userId;

    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "User ID not provided in headers" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const userUid = `/${user.uniqueId}/`;
    //   console.log(userUid)
    // Aggregation pipeline to find users with parentPath containing userUid
    const users = await User.aggregate([
      {
        $match: {
          parentPath: { $regex: userUid, $options: "i" },
        },
      },
    ]);

    return res.status(200).send({ success: true, data: [user, ...users] });
  } catch (err: any) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const logOut = async (req: Request, res: Response): Promise<any> => {
  const jti = (req as any).jti;
  try {
    if (jti) {
      tokenBlacklist.add(jti); // ✅ Add token ID to blacklist
    }
    console.log(tokenBlacklist);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

export const approveUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = (req as any).userId;
    const { userId } = req.body;

    let requester = await User.findById(id);
    if (!requester?.isSuperUser) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to approve a user",
      });
    }

    let user: any = await User.findByIdAndUpdate(
      userId,
      { $set: { isApproved: true } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "No user exists with that ID" });
    }

    // Step 1: Get parent IDs from parentPath
    let parentArray: any = user?.parentPath?.split("/").filter(Boolean);

    parentArray = user?.parentPath
      ?.split("/")
      .filter(Boolean)
      .slice(1) // skip the first ID (root)
      .map((ele: any) => Number(ele));
    // Step 2: Check if all parents are approved
    const parents = await User.find({ uniqueId: { $in: parentArray } });

    const allParentsApproved = parents.every((p) => p.isApproved);
    // Step 3: Check for approved sibling (same parent, same parentTaskId)
    const immediateParentId = parentArray[parentArray.length - 1];
    const siblings = await User.find({
      parentPath: { $regex: `${immediateParentId}/$` },
      parentTaskId: user.parentTaskId,
      _id: { $ne: user._id }, // exclude self
      isApproved: true,
    });
    if (allParentsApproved && siblings.length > 0) {
      // Step 4: Increase totalEarnings of each parent by 2500
      await User.updateMany(
        { uniqueId: { $in: parentArray } },
        { $inc: { totalEarning: 1500 } }
      );
    }

    return res.send({ success: true, message:"Approved Successfully" });
  } catch (err: any) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const requestWithdrawal = async (req: Request, res: Response): Promise<any> => {
  try{
   
  }catch(err:any){
    return res.status(500).send({ success: false, message: err.message });

  }
}
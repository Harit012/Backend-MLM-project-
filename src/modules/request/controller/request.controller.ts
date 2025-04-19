import { Request, Response } from "express";
import UserRequest from "../model/request.model";
import mongoose from "mongoose";
import { RequestReasons, RequestStatus } from "../../../utils/constants";
import User from "../../user/model/user.model";

export const getRequests = async (
  req: Request,
  res: Response
): Promise<any> => {
    try{
        const userId = (req as any).userId;
        const user: any = await User.findById(userId);
        if (!user) {
          return res.status(404).send({ success: false, message: "User not found" });
        }
        let matchondition = user.isSuperUser?{}:{customerId:new mongoose.Schema.ObjectId(userId)};
        let requests = await UserRequest.aggregate([
            {$match:matchondition},
            {$sort:{createdAt:-1}}
        ]);
        if(!requests.length){
            return res.status(404).send({success:true , message:"You have no requests"});
        }
        return res.status(200).send({success:true , data:requests});
    }catch(err:any){
      return res.status(500).send({ success: false, message: err.message });
    }
};

export const addRequests = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = (req as any).userId;
    let { reason, amountToWithdraw = 0, message = "" } = req.body;

    const trimmedMessage = message.trim();

    // Fetch user and validate
    const user: any = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Check for existing pending approval requests (if the new request is of type APPROVAL)
    if (reason === RequestReasons.APPROVAL) {
      amountToWithdraw = 0;
      const existingApprovalRequest = await UserRequest.findOne({
        customerId: user._id,
        reason: RequestReasons.APPROVAL,
        status: RequestStatus.PENDING,
      });

      if (existingApprovalRequest) {
        return res.status(409).send({
          success: false,
          message: "Your previous approval request is still under review.",
        });
      }
    }

    // If withdraw, validate available balance (considering pending withdraw requests)
    if (reason === RequestReasons.WITHDRAW) {
      const pendingWithdrawRequests = await UserRequest.find({
        customerId: user._id,
        reason: RequestReasons.WITHDRAW,
        status: RequestStatus.PENDING,
      });

      const blockedAmount = pendingWithdrawRequests.reduce(
        (sum, req: any) => sum + req.amountToWithdraw,
        0
      );

      if (blockedAmount + amountToWithdraw > user.walletBalance) {
        return res.status(400).send({
          success: false,
          message:
            "Insufficient balance to create this withdrawal request. Previous pending requests may have reserved your funds.",
        });
      }
    }

    // Create the new request
    const newRequest = await UserRequest.create({
      status: RequestStatus.PENDING,
      customerId: user._id,
      customerName: `${user.firstName} ${user.lastName}`,
      reason,
      amountToWithdraw,
      message: trimmedMessage,
      lastUpdatedBy: user._id,
    });

    return res.status(201).send({ success: true, data: newRequest });
  } catch (err: any) {
    console.error("Error in addRequests:", err);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

// export const UpdateRequest = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const userId = (req as any).userId;
//     const { requestId, status } = req.body;
//     let updatedRequest: any;
//     // console.log({ requestId, status });
//     // Fetch user and validate
//     const UpdatingUser: any = await User.findById(userId);
//     if (!UpdatingUser) {
//       return res
//         .status(404)
//         .send({ success: false, message: "User not found" });
//     } else if (!UpdatingUser.isSuperUser) {
//       return res.status(403).send({
//         success: false,
//         message: "You are not authorize to Perform this task.",
//       });
//     }

//     // yo lets check what you wannna do
//     let request: any = await UserRequest.findById(requestId);
//     if (!request) {
//       return res
//         .status(404)
//         .send({ success: false, message: "Request not found" });
//     }
//     let { reason, customerId } = request;
//     if (reason === RequestReasons.APPROVAL) {
//       if (status == RequestStatus.APPROVED) {
//         let user: any = await User.findByIdAndUpdate(
//           customerId,
//           { $set: { isApproved: true } },
//           { new: true }
//         );
//         updatedRequest = await UserRequest.findByIdAndUpdate(requestId, {
//           $set: { status: status },
//         });

//         // Step 1: Get parent IDs from parentPath
//         let parentArray: any = user?.parentPath?.split("/").filter(Boolean);

//         parentArray = user?.parentPath
//           ?.split("/")
//           .filter(Boolean)
//           .slice(1) // skip the first ID (root)
//           .map((ele: any) => Number(ele));
//         // Step 2: Check if all parents are approved
//         const parents = await User.find({ uniqueId: { $in: parentArray } });

//         const allParentsApproved = parents.every((p) => p.isApproved);
//         // Step 3: Check for approved sibling (same parent, same parentTaskId)
//         const immediateParentId = parentArray[parentArray.length - 1];
//         const siblings = await User.find({
//           parentPath: { $regex: `${immediateParentId}/$` },
//           parentTaskId: user.parentTaskId,
//           _id: { $ne: user._id }, // exclude self
//           isApproved: true,
//         });
//         if (allParentsApproved && siblings.length > 0) {
//           // Step 4: Increase totalEarnings of each parent by 2500
//           await User.updateMany(
//             { uniqueId: { $in: parentArray } },
//             { $inc: { totalEarning: 1500, walletBalance: 1500 } }
//           );
//         }
//         return res
//           .status(200)
//           .send({
//             success: true,
//             message: `${user.firstName} ${user.lastName} is Approved.`,
//           });
//       } else {
//         updatedRequest = await UserRequest.findByIdAndUpdate(requestId, {
//           $set: { status: status },
//         });
//         return res
//           .status(200)
//           .send({
//             success: true,
//             message: `request status updated to ${updatedRequest.status}`,
//           });
//       }
//     } else if (reason === RequestReasons.WITHDRAW) {
//       if (status == RequestStatus.APPROVED) {
//         let user: any = await User.findByIdAndUpdate(
//           customerId,
//           {
//             $inc: {
//               walletBalance: -request.amountToWithdraw,
//               withdrawnAmount: request.amountToWithdraw,
//             },
//           },
//           { new: true } // returns the updated user
//         );
//         updatedRequest =await UserRequest.findByIdAndUpdate(requestId, {
//             $set: { status: RequestStatus.APPROVED },
//           }); 
//       } else if (status == RequestStatus.REJECTED) {
//         updatedRequest = await UserRequest.findByIdAndUpdate(requestId, {
//           $set: { status: RequestStatus.REJECTED },
//         });
//         return res
//           .status(200)
//           .send({
//             success: true,
//             message: `request status updated to ${updatedRequest.status}`,
//           });
//       }
//     } else {
//       return res
//         .status(200)
//         .send({ success: false, message: "Not Prepared For This one" });
//     }
//   } catch (err: any) {
//     return res.status(500).send({ success: false, message: err.message });
//   }
// };


export const UpdateRequest = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { requestId, status } = req.body;
  
      // Validate admin user
      const adminUser: any = await User.findById(userId);
      if (!adminUser) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
      if (!adminUser.isSuperUser) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to perform this task.",
        });
      }
  
      // Find request
      const request: any = await UserRequest.findById(requestId);
      if (!request) {
        return res.status(404).send({ success: false, message: "Request not found" });
      }
  
      const { reason, customerId } = request;
  
      // ============ HANDLE APPROVAL REQUEST ============
      if (reason === RequestReasons.APPROVAL) {
        if (status === RequestStatus.APPROVED) {
          const user: any = await User.findByIdAndUpdate(
            customerId,
            { $set: { isApproved: true } },
            { new: true }
          );
  
          await UserRequest.findByIdAndUpdate(requestId, {
            $set: { status },
          });
  
          // Process hierarchy
          const parentArray = user?.parentPath
            ?.split("/")
            .filter(Boolean)
            .slice(1) // skip root
            .map(Number);
  
          if (parentArray?.length) {
            const [parents, siblings] = await Promise.all([
              User.find({ uniqueId: { $in: parentArray } }),
              User.find({
                parentPath: { $regex: `${parentArray.at(-1)}/$` },
                parentTaskId: user.parentTaskId,
                _id: { $ne: user._id },
                isApproved: true,
              }),
            ]);
  
            const allParentsApproved = parents.every((p) => p.isApproved);
  
            if (allParentsApproved && siblings.length > 0) {
              await User.updateMany(
                { uniqueId: { $in: parentArray } },
                { $inc: { totalEarning: 1500, walletBalance: 1500 } }
              );
            }
          }
  
          return res.status(200).send({
            success: true,
            message: `${user.firstName} ${user.lastName} is approved.`,
          });
        }
  
        // Handle rejection
        await UserRequest.findByIdAndUpdate(requestId, {
          $set: { status },
        });
  
        return res.status(200).send({
          success: true,
          message: `Request status updated to ${status}`,
        });
      }
  
      // ============ HANDLE WITHDRAW REQUEST ============
      if (reason === RequestReasons.WITHDRAW) {
        if (status === RequestStatus.APPROVED) {
          await User.findByIdAndUpdate(
            customerId,
            {
              $inc: {
                walletBalance: -request.amountToWithdraw,
                withdrawnAmount: request.amountToWithdraw,
              },
            }
          );
  
          await UserRequest.findByIdAndUpdate(requestId, {
            $set: { status: RequestStatus.APPROVED },
          });
  
          return res.status(200).send({
            success: true,
            message: `Withdrawal request approved.`,
          });
        }
  
        if (status === RequestStatus.REJECTED) {
          await UserRequest.findByIdAndUpdate(requestId, {
            $set: { status: RequestStatus.REJECTED },
          });
  
          return res.status(200).send({
            success: true,
            message: `Request status updated to ${status}`,
          });
        }
      }
  
      // ============ HANDLE UNKNOWN REASONS ============
      return res.status(400).send({
        success: false,
        message: "Unknown request reason or unsupported action.",
      });
    } catch (err: any) {
      console.error("UpdateRequest error:", err);
      return res.status(500).send({ success: false, message: "Internal server error" });
    }
  };
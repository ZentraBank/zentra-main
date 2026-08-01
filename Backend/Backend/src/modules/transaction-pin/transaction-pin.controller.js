const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./transaction-pin.service");
const status = asyncHandler(async (req,res)=>sendSuccess(res,{message:"Transaction PIN status retrieved",data:await service.getStatus({userId:req.auth.userId})}));
const setup = asyncHandler(async (req,res)=>sendSuccess(res,{statusCode:201,message:"Transaction PIN created",data:await service.setup({userId:req.auth.userId,...req.body})}));
const change = asyncHandler(async (req,res)=>sendSuccess(res,{message:"Transaction PIN changed",data:await service.change({userId:req.auth.userId,...req.body})}));
module.exports={status,setup,change};

const asyncHandler=require("../../utils/asyncHandler");
const {sendSuccess}=require("../../utils/response");
const service=require("./demo-banks.service");
exports.list=asyncHandler(async(req,res)=>sendSuccess(res,{message:"Demo banks retrieved",data:service.list()}));
exports.resolve=asyncHandler(async(req,res)=>sendSuccess(res,{message:"Demo account resolved",data:service.resolve(req.body)}));

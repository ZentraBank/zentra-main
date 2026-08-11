const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./beneficiaries.service");

const create = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Beneficiary created successfully",
    data:await service.createBeneficiary({auth:req.auth,body:req.body})},201));
const listMine = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Beneficiaries retrieved successfully",
    data:await service.listMine({auth:req.auth,query:req.query})}));
const getMine = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Beneficiary retrieved successfully",
    data:await service.getMine({auth:req.auth,beneficiaryId:req.params.beneficiaryId})}));
const updateMine = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Beneficiary updated successfully",
    data:await service.updateMine({auth:req.auth,beneficiaryId:req.params.beneficiaryId,body:req.body})}));
const removeMine = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Beneficiary removed successfully",
    data:await service.removeMine({auth:req.auth,beneficiaryId:req.params.beneficiaryId})}));

module.exports = {create,listMine,getMine,updateMine,removeMine};

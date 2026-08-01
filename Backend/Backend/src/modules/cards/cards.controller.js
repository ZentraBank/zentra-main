const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./cards.service");

const createCard = asyncHandler(async (req,res) =>
  sendSuccess(res,{
    message:"Card issued successfully",
    data:await service.createCard({auth:req.auth,body:req.body})
  },201)
);

const listOwnCards = asyncHandler(async (req,res) =>
  sendSuccess(res,{
    message:"Cards retrieved successfully",
    data:await service.listOwnCards({auth:req.auth})
  })
);

const getOwnCard = asyncHandler(async (req,res) =>
  sendSuccess(res,{
    message:"Card retrieved successfully",
    data:await service.getOwnCard({auth:req.auth,cardId:req.params.cardId})
  })
);

const changeOwnStatus = asyncHandler(async (req,res) =>
  sendSuccess(res,{
    message:"Card status updated successfully",
    data:await service.changeOwnStatus({
      auth:req.auth,cardId:req.params.cardId,status:req.body.status
    })
  })
);

const changeStatusAsAdmin = asyncHandler(async (req,res) =>
  sendSuccess(res,{
    message:"Card status updated successfully",
    data:await service.changeStatusAsAdmin({
      auth:req.auth,cardId:req.params.cardId,
      status:req.body.status,reason:req.body.reason
    })
  })
);

module.exports = {
  createCard,listOwnCards,getOwnCard,changeOwnStatus,changeStatusAsAdmin
};

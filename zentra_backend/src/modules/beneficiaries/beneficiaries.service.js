const repo = require("./beneficiaries.repository");

const httpError = (statusCode,message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const createBeneficiary = async ({ auth,body }) => {
  let accountName = body.accountName;
  let currency = body.currency;
  let internalAccountId = null;
  let bankName = body.bankName || null;
  let bankCode = body.bankCode || null;

  if (body.beneficiaryType === "internal") {
    const account = await repo.findInternalAccountByNumber({
      tenantId: auth.tenantId,
      accountNumber: body.accountNumber
    });
    if (!account) throw httpError(404,"Internal beneficiary account not found");
    if (account.status !== "active") throw httpError(403,"The beneficiary account is not active");
    if (account.user_id === auth.userId) throw httpError(409,"You cannot save your own account as a beneficiary");
    accountName = account.account_name;
    currency = account.currency;
    internalAccountId = account.id;
    bankName = "ZentraBank";
    bankCode = "ZENTRA";
  }

  const duplicate = await repo.findDuplicate({
    tenantId:auth.tenantId,userId:auth.userId,
    accountNumber:body.accountNumber,bankCode
  });
  if (duplicate) throw httpError(409,"This beneficiary already exists");

  const beneficiary = await repo.create({
    tenantId:auth.tenantId,userId:auth.userId,
    beneficiaryType:body.beneficiaryType,
    displayName:body.displayName || accountName,
    accountName,accountNumber:body.accountNumber,
    bankName,bankCode,currency,internalAccountId
  });

  await repo.createEvent({
    tenantId:auth.tenantId,beneficiaryId:beneficiary.id,
    userId:auth.userId,actorUserId:auth.userId,
    eventType:"beneficiary_created",
    metadata:{beneficiaryType:beneficiary.beneficiary_type}
  });
  return beneficiary;
};

const listMine = ({ auth,query }) => {
  const limit = Math.min(Number(query.pageSize),100);
  return repo.findByUser({
    tenantId:auth.tenantId,userId:auth.userId,
    search:query.search || null,
    favouritesOnly:query.favouritesOnly,
    limit,offset:(Number(query.page)-1)*limit
  });
};

const getMine = async ({ auth,beneficiaryId }) => {
  const item = await repo.findById({tenantId:auth.tenantId,beneficiaryId});
  if (!item || item.user_id !== auth.userId || !item.is_active) {
    throw httpError(404,"Beneficiary not found");
  }
  return item;
};

const updateMine = async ({ auth,beneficiaryId,body }) => {
  const current = await getMine({auth,beneficiaryId});
  const updated = await repo.update({
    tenantId:auth.tenantId,beneficiaryId,
    displayName:body.displayName,isFavourite:body.isFavourite
  });
  await repo.createEvent({
    tenantId:auth.tenantId,beneficiaryId,userId:current.user_id,
    actorUserId:auth.userId,eventType:"beneficiary_updated",metadata:body
  });
  return updated;
};

const removeMine = async ({ auth,beneficiaryId }) => {
  const current = await getMine({auth,beneficiaryId});
  if (!(await repo.deactivate({tenantId:auth.tenantId,beneficiaryId}))) {
    throw httpError(409,"Beneficiary could not be removed");
  }
  await repo.createEvent({
    tenantId:auth.tenantId,beneficiaryId,userId:current.user_id,
    actorUserId:auth.userId,eventType:"beneficiary_removed"
  });
  return {id:beneficiaryId,removed:true};
};

const resolveForTransfer = async ({ auth,beneficiaryId }) => {
  const beneficiary = await getMine({auth,beneficiaryId});
  if (beneficiary.beneficiary_type !== "internal") {
    throw httpError(400,"Only internal beneficiaries are supported by the current transfer module");
  }
  return {
    destinationAccountNumber:beneficiary.account_number,
    currency:beneficiary.currency,
    beneficiary
  };
};

module.exports = {
  createBeneficiary,listMine,getMine,updateMine,removeMine,resolveForTransfer
};

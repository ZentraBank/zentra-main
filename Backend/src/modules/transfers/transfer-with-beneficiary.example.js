const beneficiariesService = require("../beneficiaries/beneficiaries.service");
const transfersService = require("./transfers.service");

const createFromBeneficiary = async ({
  auth,sourceAccountId,beneficiaryId,amount,description
}) => {
  const { destinationAccountNumber,currency } =
    await beneficiariesService.resolveForTransfer({auth,beneficiaryId});

  return transfersService.createInternalTransfer({
    auth,sourceAccountId,destinationAccountNumber,
    amount,currency,description
  });
};

module.exports = { createFromBeneficiary };

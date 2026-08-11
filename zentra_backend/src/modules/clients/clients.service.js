const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");
const authRepo = require("../auth/auth.repository");
const accountsRepo = require("../accounts/accounts.repository");
const generateAccountNumber = require("../../utils/generateAccountNumber");
const repo = require("./clients.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateTemporaryPassword = () =>
  `Zb${randomBytes(6).toString("hex")}7`;

const splitAccountName = ({ firstName, middleName, lastName }) =>
  [firstName, middleName, lastName].filter(Boolean).join(" ");

const createUniqueAccountNumber = async (tenantId) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateAccountNumber();
    const exists = await accountsRepo.existsByNumber({
      accountNumber: candidate,
      tenantId,
    });
    if (!exists) return candidate;
  }
  throw httpError(500, "Unable to generate a unique account number");
};

const create = async ({ tenantId, body }) => {
  const normalizedEmail = body.email.trim().toLowerCase();
  const existing = await authRepo.findAnyUserByEmail(normalizedEmail);
  if (existing) {
    throw httpError(409, "An account already exists with this email");
  }

  const role = await authRepo.findCustomerRole(tenantId);
  if (!role) {
    throw httpError(500, "Customer role is not configured for this tenant");
  }

  const temporaryPassword = body.password || generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const created = await authRepo.createRegisteredCustomer({
    tenantId,
    roleId: role.id,
    firstName: body.firstName,
    middleName: body.middleName || null,
    lastName: body.lastName,
    email: normalizedEmail,
    phone: body.phone || null,
    passwordHash,
  });

  let account = null;
  if (body.account) {
    const accountNumber = await createUniqueAccountNumber(tenantId);
    account = await accountsRepo.create({
      userId: created.userId,
      tenantId,
      accountNumber,
      accountName:
        body.account.accountName ||
        splitAccountName(body),
      accountType: body.account.accountType || "savings",
      currency: body.account.currency || "USD",
    });
  }

  const client = await repo.findById({
    tenantId,
    clientId: created.userId,
  });

  return {
    client,
    account,
    ...(body.password ? {} : { temporaryPassword }),
  };
};

const list = ({ tenantId }) => repo.listByTenant({ tenantId });

const get = async ({ tenantId, clientId }) => {
  const client = await repo.findById({ tenantId, clientId });
  if (!client) throw httpError(404, "Client not found");
  const accounts = await accountsRepo.findByUser({
    userId: clientId,
    tenantId,
  });
  return { ...client, accounts };
};

module.exports = { create, list, get };

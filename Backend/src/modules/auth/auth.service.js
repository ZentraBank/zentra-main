const bcrypt = require("bcryptjs");
const authRepo = require("./auth.repository");
const { generateToken } = require("../../utils/token");
const generateAccountNumber = require("../../utils/generateAccountNumber");

async function registerUser({ tenantId, full_name, email, phone, password }) {
  if (!full_name || !email || !password) {
    throw new Error("Full name, email, and password are required");
  }

  const existingUser = await authRepo.findUserByEmailAndTenant(email, tenantId);

  if (existingUser) {
    throw new Error("Email already exists for this tenant");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const accountNumber = generateAccountNumber();

  const result = await authRepo.createUserWithAccount({
    tenantId,
    fullName: full_name,
    email,
    phone,
    passwordHash,
    accountNumber,
  });

  const token = generateToken({
    userId: result.userId,
    tenantId,
    role: "customer",
  });

  return {
    token,
    user: {
      id: result.userId,
      full_name,
      email,
      phone: phone || null,
      role: "customer",
      kyc_status: "not_started",
    },
    account: {
      account_number: accountNumber,
      account_name: full_name,
      balance: 0,
      currency: "NGN",
    },
  };
}

async function loginUser({ tenantId, email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await authRepo.findUserByEmailAndTenant(email, tenantId);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kyc_status: user.kyc_status,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
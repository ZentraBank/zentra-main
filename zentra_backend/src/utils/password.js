const bcrypt = require("bcryptjs");

const PASSWORD_SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
};

const comparePassword = async (
  password,
  passwordHash
) => {
  return bcrypt.compare(password, passwordHash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
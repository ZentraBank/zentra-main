const bcrypt = require("bcryptjs");
const db = require("../../config/db");

const repo = require("./platform-admin.repository");
const authRepo = require(
  "../platform-auth/platform-auth.repository"
);

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createUser = async ({
  auth,
  body,
}) => {
  const existing = await repo.findByEmail(
    body.email
  );

  if (existing) {
    throw httpError(
      409,
      "A platform user with this email already exists."
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(
      body.temporaryPassword,
      Number(process.env.BCRYPT_ROUNDS || 12)
    );

    const userId = await repo.create({
      connection,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      roleCode: body.roleCode,
      passwordHash,
      status: body.status || "active",
      createdBy: auth.userId,
    });

    await repo.replacePermissions({
      connection,
      platformUserId: userId,
      permissions: body.permissions,
      grantedBy: auth.userId,
    });

    await connection.commit();

    return getUser(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getUser = async (userId) => {
  const user = await repo.findById(userId);

  if (!user) {
    throw httpError(
      404,
      "Platform user not found."
    );
  }

  return {
    ...user,
    permissions:
      await repo.listPermissions(userId),
  };
};

const updatePermissions = async ({
  auth,
  userId,
  permissions,
}) => {
  const target = await repo.findById(userId);

  if (!target) {
    throw httpError(
      404,
      "Platform user not found."
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await repo.replacePermissions({
      connection,
      platformUserId: userId,
      permissions,
      grantedBy: auth.userId,
    });

    await connection.commit();

    await authRepo.revokeAllRefreshTokens(
      userId
    );

    return getUser(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateStatus = async ({
  auth,
  userId,
  status,
}) => {
  if (
    auth.userId === userId &&
    status !== "active"
  ) {
    throw httpError(
      409,
      "You cannot suspend or disable your own platform account."
    );
  }

  const target = await repo.findById(userId);

  if (!target) {
    throw httpError(
      404,
      "Platform user not found."
    );
  }

  const updated = await repo.updateStatus({
    userId,
    status,
  });

  if (status !== "active") {
    await authRepo.revokeAllRefreshTokens(
      userId
    );
  }

  return updated;
};

module.exports = {
  createUser,
  getUser,
  updatePermissions,
  updateStatus,

  listUsers: ({ query }) =>
    repo.listUsers({
      page: Number(query.page || 1),
      limit: Math.min(
        Number(query.limit || 20),
        100
      ),
      search: query.search,
      role: query.role,
      status: query.status,
    }),

  updateUser: async ({
    userId,
    body,
  }) => {
    const target = await repo.findById(userId);

    if (!target) {
      throw httpError(
        404,
        "Platform user not found."
      );
    }

    return repo.update({
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      roleCode: body.roleCode,
    });
  },
};

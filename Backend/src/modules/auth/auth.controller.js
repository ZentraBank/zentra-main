const authService = require("./auth.service");

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res, next) {
  try {
    const result = await authService.registerUser({
      tenantId: req.tenant.id,
      ...req.body,
    });

    setAuthCookie(res, result.token);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: result.user,
        account: result.account,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser({
      tenantId: req.tenant.id,
      ...req.body,
    });

    setAuthCookie(res, result.token);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user,
      tenant: req.tenant,
    },
  });
}

async function logout(req, res) {
  res.clearCookie("token");

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};
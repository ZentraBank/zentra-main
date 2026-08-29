const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  host: env.email.smtp.host,
  port: env.email.smtp.port,
  secure: env.email.smtp.secure,

  auth: {
    user: env.email.smtp.user,
    pass: env.email.smtp.password,
  },
});

const getFromAddress = () =>
  `"${env.email.from.name}" <${env.email.from.address}>`;

const verifyConnection = async () => {
  try {
    await transporter.verify();

    console.log(
      `[EMAIL] SMTP connected: ${env.email.smtp.host}:${env.email.smtp.port}`
    );

    return true;
  } catch (error) {
    console.error(
      "[EMAIL] SMTP connection failed:",
      error.message
    );

    throw error;
  }
};

const sendMail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to) {
    throw new Error("Email recipient is required.");
  }

  try {
    const result = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });

    console.log("[EMAIL] Message sent", {
      messageId: result.messageId,
      to,
      subject,
    });

    return result;
  } catch (error) {
    console.error("[EMAIL] Message failed", {
      to,
      subject,
      error: error.message,
    });

    throw error;
  }
};

const sendRegistrationOtp = async ({
  email,
  code,
  expiresInMinutes = 10,
}) => {
  if (!email) {
    throw new Error(
      "Email is required to send registration OTP."
    );
  }

  if (!code) {
    throw new Error(
      "OTP code is required."
    );
  }

  const subject =
    "Verify your ZentraBank email address";

  const text = `
Your ZentraBank verification code is:

${code}

This code expires in ${expiresInMinutes} minutes.

If you did not attempt to register for ZentraBank, you can safely ignore this message.

Never share this verification code with anyone.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>ZentraBank Verification</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f4f6fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <table
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    role="presentation"
    style="
      background-color:#f4f6fb;
      padding:32px 16px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          role="presentation"
          style="
            max-width:520px;
            background-color:#ffffff;
            border-radius:16px;
            overflow:hidden;
          "
        >

          <tr>
            <td
              style="
                background-color:#2458e8;
                padding:28px;
                text-align:center;
              "
            >
              <div
                style="
                  font-size:26px;
                  font-weight:700;
                  color:#ffffff;
                "
              >
                ZentraBank
              </div>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:36px 32px;
              "
            >

              <h1
                style="
                  margin:0;
                  margin-bottom:14px;
                  text-align:center;
                  color:#111827;
                  font-size:24px;
                "
              >
                Verify your email
              </h1>

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  text-align:center;
                  font-size:15px;
                  line-height:24px;
                "
              >
                Enter the verification code below
                to continue your ZentraBank registration.
              </p>

              <div
                style="
                  margin:30px 0;
                  padding:22px;
                  background-color:#f3f6ff;
                  border-radius:12px;
                  text-align:center;
                "
              >
                <span
                  style="
                    font-size:34px;
                    font-weight:800;
                    letter-spacing:10px;
                    color:#2458e8;
                  "
                >
                  ${code}
                </span>
              </div>

              <p
                style="
                  color:#374151;
                  text-align:center;
                  font-size:14px;
                  line-height:22px;
                "
              >
                This code will expire in
                <strong>${expiresInMinutes} minutes</strong>.
              </p>

              <p
                style="
                  margin-top:28px;
                  color:#9ca3af;
                  text-align:center;
                  font-size:12px;
                  line-height:19px;
                "
              >
                If you did not attempt to create
                a ZentraBank account, you can safely
                ignore this email.
              </p>

              <p
                style="
                  color:#9ca3af;
                  text-align:center;
                  font-size:12px;
                  line-height:19px;
                "
              >
                Never share this verification code
                with anyone.
              </p>

            </td>
          </tr>

          <tr>
            <td
              style="
                padding:20px;
                background-color:#f9fafb;
                color:#9ca3af;
                font-size:11px;
                text-align:center;
              "
            >
              © ${new Date().getFullYear()} ZentraBank.
              All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
};

const sendPasswordResetOtp = async ({
  email,
  code,
  expiresInMinutes = 10,
}) => {
  if (!email) {
    throw new Error(
      "Email is required to send password reset OTP."
    );
  }

  if (!code) {
    throw new Error(
      "OTP code is required."
    );
  }

  const subject =
    "Reset your ZentraBank password";

  const text = `
Your ZentraBank password reset code is:

${code}

This code expires in ${expiresInMinutes} minutes.

If you did not request a password reset, you can safely ignore this message.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<body
  style="
    margin:0;
    padding:0;
    background-color:#f4f6fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      max-width:520px;
      margin:40px auto;
      background-color:#ffffff;
      padding:32px;
      border-radius:16px;
      text-align:center;
    "
  >
    <h1
      style="
        color:#111827;
      "
    >
      Password reset
    </h1>

    <p
      style="
        color:#6b7280;
      "
    >
      Use the code below to reset
      your ZentraBank password.
    </p>

    <div
      style="
        margin:28px 0;
        padding:20px;
        background-color:#f3f6ff;
        color:#2458e8;
        font-size:34px;
        font-weight:800;
        letter-spacing:10px;
        border-radius:12px;
      "
    >
      ${code}
    </div>

    <p
      style="
        color:#374151;
      "
    >
      This code expires in
      <strong>${expiresInMinutes} minutes</strong>.
    </p>

    <p
      style="
        margin-top:28px;
        color:#9ca3af;
        font-size:12px;
      "
    >
      If you did not request this change,
      you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
};

module.exports = {
  verifyConnection,
  sendMail,
  sendRegistrationOtp,
  sendPasswordResetOtp,
};
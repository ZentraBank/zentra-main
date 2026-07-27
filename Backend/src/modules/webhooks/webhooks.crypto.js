const crypto =
  require("crypto");

const getEncryptionKey = () => {
  const value =
    process.env
      .WEBHOOK_SECRET_ENCRYPTION_KEY;

  if (!value) {
    throw new Error(
      "WEBHOOK_SECRET_ENCRYPTION_KEY is required"
    );
  }

  return crypto
    .createHash("sha256")
    .update(value)
    .digest();
};

const encryptSecret = (
  secret
) => {
  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      iv
    );

  const encrypted =
    Buffer.concat([
      cipher.update(
        secret,
        "utf8"
      ),
      cipher.final(),
    ]);

  const authTag =
    cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
};

const decryptSecret = (
  value
) => {
  const [
    iv,
    authTag,
    encrypted,
  ] = value.split(".");

  const decipher =
    crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(
        iv,
        "base64"
      )
    );

  decipher.setAuthTag(
    Buffer.from(
      authTag,
      "base64"
    )
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(
        encrypted,
        "base64"
      )
    ),
    decipher.final(),
  ]).toString("utf8");
};

const signPayload = ({
  secret,
  timestamp,
  rawBody,
}) =>
  crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(
      `${timestamp}.${rawBody}`
    )
    .digest("hex");

module.exports = {
  encryptSecret,
  decryptSecret,
  signPayload,
};

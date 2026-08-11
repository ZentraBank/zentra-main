const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listSettings = async () => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        setting_key,
        setting_value,
        is_secret,
        description,
        updated_by,
        created_at,
        updated_at
      FROM platform_settings
      ORDER BY setting_key ASC
    `
  );

  return rows;
};

const findByKey = async (settingKey) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM platform_settings
      WHERE setting_key = ?
      LIMIT 1
    `,
    [settingKey]
  );

  return rows[0] || null;
};

const upsert = async ({
  settingKey,
  settingValue,
  isSecret,
  description,
  updatedBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO platform_settings (
        id,
        setting_key,
        setting_value,
        is_secret,
        description,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        is_secret = VALUES(is_secret),
        description = VALUES(description),
        updated_by = VALUES(updated_by)
    `,
    [
      id,
      settingKey,
      JSON.stringify(settingValue),
      Boolean(isSecret),
      description || null,
      updatedBy,
    ]
  );

  return findByKey(settingKey);
};

const createHistory = async ({
  settingKey,
  previousValue,
  newValue,
  changedBy,
  reason,
}) => {
  await db.query(
    `
      INSERT INTO platform_setting_history (
        id,
        setting_key,
        previous_value,
        new_value,
        changed_by,
        reason
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      settingKey,
      previousValue
        ? JSON.stringify(previousValue)
        : null,
      JSON.stringify(newValue),
      changedBy,
      reason || null,
    ]
  );
};

const listHistory = async ({
  settingKey,
  limit,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM platform_setting_history
      WHERE setting_key = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [settingKey, limit]
  );

  return rows;
};

module.exports = {
  listSettings,
  findByKey,
  upsert,
  createHistory,
  listHistory,
};

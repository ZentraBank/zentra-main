const repo = require("./platform-settings.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const maskSecret = (setting) => {
  if (!setting) return null;

  return {
    ...setting,
    setting_value: setting.is_secret
      ? { masked: true }
      : setting.setting_value,
  };
};

module.exports = {
  listSettings: async () => {
    const settings = await repo.listSettings();
    return settings.map(maskSecret);
  },

  getSetting: async (settingKey) => {
    const setting = await repo.findByKey(settingKey);

    if (!setting) {
      throw httpError(
        404,
        "Platform setting not found."
      );
    }

    return maskSecret(setting);
  },

  upsertSetting: async ({
    auth,
    settingKey,
    body,
  }) => {
    const previous =
      await repo.findByKey(settingKey);

    const updated = await repo.upsert({
      settingKey,
      settingValue: body.value,
      isSecret: body.isSecret,
      description: body.description,
      updatedBy: auth.userId,
    });

    await repo.createHistory({
      settingKey,
      previousValue:
        previous?.setting_value || null,
      newValue: body.value,
      changedBy: auth.userId,
      reason: body.reason,
    });

    return maskSecret(updated);
  },

  listHistory: ({ settingKey, query }) =>
    repo.listHistory({
      settingKey,
      limit: Math.min(
        Number(query.limit || 50),
        200
      ),
    }),
};

require("dotenv").config();

const db =
  require(
    "../src/config/db"
  );

const service =
  require(
    "../src/modules/recurring-payments/recurring.service"
  );

const run = async () => {
  const [tenants] =
    await db.query(
      `
        SELECT id
        FROM tenants
        WHERE status = 'active'
      `
    );

  for (
    const tenant
    of tenants
  ) {
    const result =
      await service
        .executeDueSchedules({
          tenantId:
            tenant.id,
          limit: 500,
        });

    console.log(
      `[recurring-payments] tenant=${tenant.id} processed=${result.processed}`
    );
  }

  process.exit(0);
};

run().catch((error) => {
  console.error(
    "[recurring-payments] failed",
    error
  );

  process.exit(1);
});

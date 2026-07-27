require("dotenv").config();

const {
  registerAll,
} = require(
  "../src/modules/jobs/jobs.scheduler"
);

registerAll()
  .then((count) => {
    console.log(
      `Registered ${count} scheduled jobs`
    );

    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

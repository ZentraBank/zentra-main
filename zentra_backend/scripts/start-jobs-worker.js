require("dotenv").config();

require(
  "../src/modules/jobs/jobs.worker"
);

console.log(
  "ZentraBank job workers started"
);

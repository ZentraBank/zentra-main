require("dotenv").config();

require(
  "../src/modules/webhooks/webhooks.dispatcher"
);

console.log(
  "ZentraBank webhook worker started"
);

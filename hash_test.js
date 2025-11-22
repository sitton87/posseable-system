const bcrypt = require("bcrypt");

async function generate() {
  const hash = await bcrypt.hash("posseable2025!", 10);
  console.log("HASH:", hash);
}

generate();

const domains = require("./domains.json");
const manifest = require("../manifest.json");
const fs = require("fs");

function patch() {
  const newManifestPermissions = domains.map((domain) => `https://${domain}/*`);
  manifest.permissions = newManifestPermissions;

  fs.writeFileSync(
    `${__dirname}/../manifest.json`,
    JSON.stringify(manifest, null, 2)
  );

  console.log("Patched manifest.json!");

  const worker = fs.readFileSync(`${__dirname}/../worker.js`, "utf8");
  const newWorker = worker.replace(
    /const STREAMTAPEDOMAINS = \[.*\]/,
    `const STREAMTAPEDOMAINS = ${JSON.stringify(domains)}`
  );

  fs.writeFileSync(`${__dirname}/../worker.js`, newWorker);

  console.log("Patched worker.js!");
}

patch();

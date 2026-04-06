const crypto = require("crypto");

function escapeHashValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function base64Sha512(input) {
  return crypto.createHash("sha512").update(input, "utf8").digest("base64");
}

const params = {
  clientid: "190000101",
  storetype: "3d_pay_hosting",
  trantype: "Auth",
  amount: "150.00",
  currency: "949",
  oid: "INV-123456",
  okUrl: "http://localhost:3000/api/webhooks/ziraat",
  failUrl: "http://localhost:3000/api/webhooks/ziraat",
  instalment: "",
  lang: "en",
  rnd: "abcd1234ef",
  encoding: "UTF-8",
  hashAlgorithm: "ver3"
};

const storeKey = "TEST.test1234!!1"; // Or whatever is the store key

const ignoredKeys = new Set(["hash", "encoding"]);
const keys = Object.keys(params)
  .filter((k) => !ignoredKeys.has(k.toLowerCase()))
  .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));

const vals = keys.map((k) => escapeHashValue(params[k] ?? ""));
const hashInput = `${vals.join("|")}|${escapeHashValue(storeKey)}`;
console.log("Keys order (case-insensitive):", keys);
console.log("Hash input:", hashInput);
console.log("Hash output:", base64Sha512(hashInput));

const keys2 = Object.keys(params)
  .filter((k) => !ignoredKeys.has(k.toLowerCase()))
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
console.log("Keys order (case-sensitive):", keys2);

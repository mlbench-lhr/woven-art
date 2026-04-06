const crypto = require("crypto");

function escapeHashValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

const params = {
  clientid: "190000101",
  storetype: "3d_pay_hosting",
  trantype: "Auth",
  amount: "150.00",
  currency: "949",
  oid: "INV-123456",
  okUrl: "x",
  failUrl: "x",
  lang: "en",
  rnd: "abcd1234ef",
  encoding: "UTF-8",
  hashAlgorithm: "ver3"
  // instalment is omitted
};

const storeKey = "TEST.test1234!!1"; 

const ignoredKeys = new Set(["hash", "encoding"]);
const keys = Object.keys(params)
  .filter((k) => !ignoredKeys.has(k.toLowerCase()))
  .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));

const vals = keys.map((k) => escapeHashValue(params[k] ?? ""));
console.log(vals.join("|"));

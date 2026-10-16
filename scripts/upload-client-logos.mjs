// Uploads the original client logo marks and attaches them to the Product page.
// Usage: node scripts/upload-client-logos.mjs
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { logoFields, uploadClientLogos } from "./client-logos.mjs";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const {
  CONTENTSTACK_API_KEY: apiKey,
  CONTENTSTACK_MANAGEMENT_TOKEN: managementToken,
  CONTENTSTACK_ENVIRONMENT: environment = "staging",
  CONTENTSTACK_REGION: region = "us",
} = process.env;

if (!apiKey || !managementToken) {
  console.error("Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN in .env.local");
  process.exit(1);
}

const hosts = {
  us: "api.contentstack.io",
  eu: "eu-api.contentstack.com",
  au: "au-api.contentstack.com",
  "azure-na": "azure-na-api.contentstack.com",
  "azure-eu": "azure-eu-api.contentstack.com",
  "gcp-na": "gcp-na-api.contentstack.com",
  "gcp-eu": "gcp-eu-api.contentstack.com",
};
const apiHost = hosts[region] ?? hosts.us;
const locale = "en-us";

async function cma(method, path, body) {
  const response = await fetch(`https://${apiHost}/v3${path}`, {
    method,
    headers: { api_key: apiKey, authorization: managementToken, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function isAsset(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.uid === "string" &&
    ("filename" in value || "file_size" in value || "permanent_url" in value),
  );
}

function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (!node || typeof node !== "object") return node;
  if (isAsset(node)) return node.uid;
  const next = {};
  for (const [key, value] of Object.entries(node)) next[key] = walk(value);
  return next;
}

const SYSTEM = new Set([
  "uid", "created_at", "updated_at", "created_by", "updated_by", "_version", "ACL",
  "publish_details", "_in_progress", "locale", "_metadata", "_branch", "_workflow",
  "_restore_status", "_version_name", "stackHeaders",
]);

function contentFields(entry) {
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    if (!SYSTEM.has(key)) out[key] = value;
  }
  return out;
}

const uids = await uploadClientLogos({ apiHost, apiKey, managementToken, environment, locale, cma });

const query = encodeURIComponent(JSON.stringify({ url: "/product" }));
const found = await cma("GET", `/content_types/page/entries?locale=${locale}&query=${query}`);
if (!found.ok || !found.data.entries?.[0]) {
  console.error("Product page entry was not found.");
  process.exit(1);
}

const current = found.data.entries[0];
const entry = walk(contentFields(current));
const sections = Array.isArray(entry.sections) ? entry.sections : [];
let block = sections.find((section) => section.clients);
if (!block) {
  block = { clients: { heading: "Our clients", logos: [] } };
  const heroAt = sections.findIndex((section) => section.hero);
  sections.splice(heroAt + 1, 0, block);
  entry.sections = sections;
}
block.clients.heading = block.clients.heading || "Our clients";
block.clients.logos = logoFields(uids);

const saved = await cma("PUT", `/content_types/page/entries/${current.uid}?locale=${locale}`, { entry });
if (!saved.ok) {
  console.error(`Saving Product failed (${saved.status}):`, saved.data.error_message ?? saved.data);
  if (saved.data.errors) console.error(JSON.stringify(saved.data.errors, null, 2));
  process.exit(1);
}

const published = await cma("POST", `/content_types/page/entries/${current.uid}/publish`, {
  entry: { environments: [environment], locales: [locale] },
});
if (!published.ok) {
  console.error(`Publishing Product failed (${published.status}):`, published.data.error_message ?? published.data);
  process.exit(1);
}

console.log("Client logos attached to the Product page and published to", environment + ".");

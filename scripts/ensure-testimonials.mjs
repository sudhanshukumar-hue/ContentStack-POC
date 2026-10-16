// Creates additional testimonials and points existing quote sections at all of them.
// Usage: npm run setup:testimonials
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ensureTestimonials } from "./testimonials.mjs";

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

try {
  const quotes = await ensureTestimonials({ apiHost, apiKey, managementToken, environment, locale, cma });
  console.log(`Testimonials ready: ${quotes.length} published to ${environment}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

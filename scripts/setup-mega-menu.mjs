// Creates (or updates) the `mega_menu` content type and its sample entries,
// then publishes them. Usage: npm run setup:mega-menu
// Requires CONTENTSTACK_MANAGEMENT_TOKEN in .env.local (Settings > Tokens > Management Tokens, read/write).
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { sampleEntries } from "./mega-menu-entries.mjs";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const {
  CONTENTSTACK_API_KEY: apiKey,
  CONTENTSTACK_DELIVERY_TOKEN: deliveryToken,
  CONTENTSTACK_MANAGEMENT_TOKEN: managementToken,
  CONTENTSTACK_ENVIRONMENT: environment = "staging",
  CONTENTSTACK_REGION: region = "us",
} = process.env;

if (!apiKey || !managementToken) {
  console.error("Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN in .env.local");
  process.exit(1);
}

const hosts = {
  us: ["api.contentstack.io", "cdn.contentstack.io"],
  eu: ["eu-api.contentstack.com", "eu-cdn.contentstack.com"],
  au: ["au-api.contentstack.com", "au-cdn.contentstack.com"],
  "azure-na": ["azure-na-api.contentstack.com", "azure-na-cdn.contentstack.com"],
  "azure-eu": ["azure-eu-api.contentstack.com", "azure-eu-cdn.contentstack.com"],
  "gcp-na": ["gcp-na-api.contentstack.com", "gcp-na-cdn.contentstack.com"],
  "gcp-eu": ["gcp-eu-api.contentstack.com", "gcp-eu-cdn.contentstack.com"],
};
const [apiHost, cdnHost] = hosts[region] ?? hosts.us;
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

function fail(step, result) {
  console.error(`${step} failed (${result.status}):`, result.data.error_message ?? result.data);
  if (result.data.errors) console.error(JSON.stringify(result.data.errors, null, 2));
  process.exit(1);
}

const text = (uid, display_name, extra = {}) => ({
  data_type: "text", uid, display_name, field_metadata: { description: "" }, mandatory: false, multiple: false, ...extra,
});
const linkField = (uid, display_name, multiple = false) => ({
  data_type: "link", uid, display_name, field_metadata: { description: "" }, mandatory: false, multiple,
});

const contentType = {
  title: "Mega Menu",
  uid: "mega_menu",
  description: "One entry per top-level navigation tab. The title must match a header nav item label to replace it.",
  options: { is_page: false, singleton: false, title: "title", sub_title: [] },
  schema: [
    text("title", "Title", { unique: true, mandatory: true, field_metadata: { _default: true } }),
    { data_type: "number", uid: "order", display_name: "Order", field_metadata: { description: "" }, mandatory: false, multiple: false },
    linkField("link", "Link"),
    {
      data_type: "group",
      uid: "columns",
      display_name: "Columns",
      field_metadata: { description: "" },
      multiple: true,
      mandatory: false,
      schema: [
        {
          data_type: "group",
          uid: "sections",
          display_name: "Sections",
          field_metadata: { description: "" },
          multiple: true,
          mandatory: false,
          schema: [text("heading", "Heading"), linkField("links", "Links", true)],
        },
        { data_type: "file", uid: "promo_image", display_name: "Promo Image", field_metadata: { description: "" }, mandatory: false, multiple: false },
        linkField("promo_link", "Promo Link"),
        linkField("footer_link", "Footer Link"),
      ],
    },
    {
      data_type: "group",
      uid: "slides",
      display_name: "Slides",
      field_metadata: { description: "Featured cards that rotate under the columns.", instruction: "Add two or more slides. The menu shows one at a time." },
      multiple: true,
      mandatory: false,
      schema: [
        { data_type: "file", uid: "image", display_name: "Image", field_metadata: { description: "" }, mandatory: false, multiple: false },
        text("title", "Title"),
        text("description", "Description", { field_metadata: { description: "", multiline: true } }),
        linkField("link", "Link"),
      ],
    },
  ],
};

async function findPromoAssetUid() {
  if (!deliveryToken) return undefined;
  const url = `https://${cdnHost}/v3/content_types/home_page/entries?environment=${encodeURIComponent(environment)}`;
  const response = await fetch(url, { headers: { api_key: apiKey, access_token: deliveryToken } });
  if (!response.ok) return undefined;
  const data = await response.json();
  const hero = data.entries?.[0]?.sections?.find((section) => section.hero)?.hero;
  return hero?.image?.image?.uid ?? hero?.image?.uid;
}

async function upsertContentType() {
  const existing = await cma("GET", "/content_types/mega_menu");
  const result = existing.ok
    ? await cma("PUT", "/content_types/mega_menu", { content_type: contentType })
    : await cma("POST", "/content_types", { content_type: contentType });
  if (!result.ok) fail("Saving content type", result);
  console.log(`Content type mega_menu ${existing.ok ? "updated" : "created"}.`);
}

async function upsertEntry(entry) {
  const query = encodeURIComponent(JSON.stringify({ title: entry.title }));
  const found = await cma("GET", `/content_types/mega_menu/entries?locale=${locale}&query=${query}`);
  const existingUid = found.data.entries?.[0]?.uid;
  const saved = existingUid
    ? await cma("PUT", `/content_types/mega_menu/entries/${existingUid}?locale=${locale}`, { entry })
    : await cma("POST", `/content_types/mega_menu/entries?locale=${locale}`, { entry });
  if (!saved.ok) fail(`Saving entry "${entry.title}"`, saved);

  const uid = saved.data.entry.uid;
  const published = await cma("POST", `/content_types/mega_menu/entries/${uid}/publish`, {
    entry: { environments: [environment], locales: [locale] },
  });
  if (!published.ok) fail(`Publishing entry "${entry.title}"`, published);
  console.log(`Entry "${entry.title}" ${existingUid ? "updated" : "created"} and published to ${environment}.`);
}

await upsertContentType();
const promoImage = await findPromoAssetUid();
for (const entry of sampleEntries(promoImage)) {
  await upsertEntry(entry);
}

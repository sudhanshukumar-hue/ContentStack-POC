// Creates the Page content type, publishes sample pages, and points navigation at them.
// Usage: npm run setup:pages
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
  console.error("Create one in the stack: Settings > Tokens > Management Tokens, with read/write scope.");
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
  data_type: "text", uid, display_name, field_metadata: { description: "" }, mandatory: false, multiple: false, unique: false, ...extra,
});
const multiline = (uid, display_name) => text(uid, display_name, { field_metadata: { description: "", multiline: true } });
const linkField = (uid, display_name, multiple = false) => ({
  data_type: "link", uid, display_name, field_metadata: { description: "" }, mandatory: false, multiple,
});
const dropdown = (uid, display_name, choices, defaultValue) => ({
  data_type: "text",
  uid,
  display_name,
  display_type: "dropdown",
  enum: { advanced: false, choices: choices.map((value) => ({ value })) },
  field_metadata: { description: "", default_value: defaultValue },
  mandatory: false,
  multiple: false,
  unique: false,
});
const group = (uid, display_name, schema, multiple = false) => ({
  data_type: "group", uid, display_name, field_metadata: { description: "" }, multiple, mandatory: false, schema,
});
const file = (uid, display_name) => ({
  data_type: "file", uid, display_name, field_metadata: { description: "" }, mandatory: false, multiple: false,
});
const bool = (uid, display_name) => ({
  data_type: "boolean", uid, display_name, field_metadata: { description: "", default_value: false }, mandatory: false, multiple: false,
});
const reference = (uid, display_name, types) => ({
  data_type: "reference",
  uid,
  display_name,
  reference_to: types,
  field_metadata: { description: "", ref_multiple: true, ref_multiple_content_types: true },
  mandatory: false,
  multiple: true,
});

const image = group("image", "Image", [file("image", "Image"), text("alt", "Alt")]);
const cta = group("cta", "CTA", [
  text("label", "Label"),
  linkField("url", "URL"),
  dropdown("style_variant", "Style variant", ["primary", "secondary", "ghost"], "primary"),
]);

const contentType = {
  title: "Page",
  uid: "page",
  description: "A website page. Set the URL, add sections, and publish. The site renders it without a code change.",
  options: {
    is_page: true,
    singleton: false,
    title: "title",
    sub_title: ["url"],
    url_pattern: "/:title",
    url_prefix: "/",
  },
  schema: [
    text("title", "Title", { unique: true, mandatory: true, field_metadata: { description: "", _default: true } }),
    text("url", "URL", { unique: true, mandatory: true, field_metadata: { description: "Path on the site, for example /partners", _default: true } }),
    group("seo", "SEO", [text("meta_title", "Meta title"), multiline("meta_description", "Meta description")]),
    {
      data_type: "blocks",
      uid: "sections",
      display_name: "Sections",
      field_metadata: { description: "", instruction: "Stack the blocks that make up this page. Order is the order on the site." },
      multiple: true,
      mandatory: false,
      blocks: [
        {
          title: "Hero",
          uid: "hero",
          schema: [
            text("eyebrow", "Eyebrow"),
            text("heading", "Heading", { mandatory: true }),
            multiline("subheading", "Subheading"),
            image,
            dropdown("theme", "Theme", ["light", "dark"], "light"),
            cta,
          ],
        },
        {
          title: "Feature grid",
          uid: "feature_grid",
          schema: [
            text("heading", "Heading"),
            dropdown("columns", "Columns", ["2", "3", "4"], "3"),
            group("features", "Features", [
              text("icon", "Icon"),
              text("title", "Title", { mandatory: true }),
              multiline("description", "Description"),
              linkField("link", "Link"),
            ], true),
          ],
        },
        {
          title: "Stats",
          uid: "stats",
          schema: [
            text("heading", "Heading"),
            group("items", "Items", [text("value", "Value", { mandatory: true }), text("label", "Label")], true),
          ],
        },
        {
          title: "Split",
          uid: "split",
          schema: [
            text("eyebrow", "Eyebrow"),
            text("heading", "Heading"),
            multiline("body", "Body"),
            image,
            dropdown("image_side", "Image side", ["left", "right"], "right"),
            cta,
          ],
        },
        {
          title: "Steps",
          uid: "steps",
          schema: [
            text("heading", "Heading"),
            multiline("intro", "Intro"),
            group("items", "Items", [text("title", "Title", { mandatory: true }), multiline("description", "Description")], true),
          ],
        },
        {
          title: "Testimonials",
          uid: "testimonials",
          schema: [text("heading", "Heading"), reference("reference", "Testimonials", ["testimonials"])],
        },
        {
          title: "Pricing",
          uid: "pricing",
          schema: [
            text("heading", "Heading"),
            multiline("intro", "Intro"),
            group("tiers", "Tiers", [
              text("name", "Name", { mandatory: true }),
              text("price", "Price"),
              text("cadence", "Cadence"),
              multiline("description", "Description"),
              bool("featured", "Featured"),
              text("features", "Features", { multiple: true }),
              cta,
            ], true),
          ],
        },
        {
          title: "FAQ",
          uid: "faq",
          schema: [
            text("heading", "Heading"),
            multiline("intro", "Intro"),
            group("items", "Items", [text("question", "Question", { mandatory: true }), multiline("answer", "Answer")], true),
          ],
        },
        {
          title: "Rich text",
          uid: "rich_text",
          schema: [text("heading", "Heading"), multiline("body", "Body")],
        },
        {
          title: "Contact",
          uid: "contact",
          schema: [
            text("heading", "Heading"),
            multiline("intro", "Intro"),
            group("details", "Details", [text("label", "Label"), text("value", "Value")], true),
          ],
        },
        {
          title: "CTA banner",
          uid: "cta_banner",
          schema: [
            text("heading", "Heading", { mandatory: true }),
            multiline("text", "Text"),
            cta,
            dropdown("background", "Background", ["brand", "neutral", "gradient"], "brand"),
          ],
        },
      ],
    },
  ],
};

function button(label, href, style_variant = "primary") {
  return { label, url: { title: label, href }, style_variant };
}

function feature(title, description, icon, href) {
  return { title, description, icon, ...(href ? { link: { title, href } } : {}) };
}

function samplePages(imageUid, quotes) {
  const picture = imageUid ? { image: imageUid, alt: "Lumio workspace" } : undefined;
  const quotesBlock = quotes.length
    ? [{ testimonials: { heading: "Teams who plan in the open", reference: quotes } }]
    : [];

  return [
    {
      title: "Product",
      url: "/product",
      seo: {
        meta_title: "Product | Lumio",
        meta_description: "Boards, timelines, goals, and live reporting in one planning workspace.",
      },
      sections: [
        { hero: { eyebrow: "Product", heading: "Plan the work. Show the progress.", subheading: "Lumio keeps boards, timelines, goals, and reporting in one workspace, so a launch plan does not live in five tools.", theme: "light", image: picture, cta: button("See pricing", "/pricing") } },
        { stats: { items: [
          { value: "12k", label: "teams planning in Lumio" },
          { value: "40%", label: "faster launch cycles" },
          { value: "99.9%", label: "uptime over the last year" },
          { value: "50+", label: "tools teams connect" },
        ] } },
        { feature_grid: { heading: "What ships with the product", columns: "4", features: [
          feature("Task boards", "Move work across stages without losing the conversation attached to it.", "▦"),
          feature("Timelines", "Sequence a release and see which date actually slips.", "↗"),
          feature("Goals", "Tie the sprint to the outcome leadership asked for.", "◎"),
          feature("Roadmaps", "Share one plan with product, engineering, and the customer.", "☰"),
          feature("Live reporting", "Status comes from the work, not from a Friday spreadsheet.", "▣"),
          feature("Dashboards", "Give each team the view they asked for, from the same data.", "▦"),
          feature("Workload", "See who is over capacity before the week starts.", "☷"),
          feature("AI summaries", "Turn a noisy thread into the decision, the owner, and the date.", "✦"),
        ] } },
        { split: { eyebrow: "AI summaries", heading: "A summary of the decision, not the thread", body: "Lumio reads the comments on a piece of work and writes the outcome: what changed, who owns it, and when it is due.\n\nEditors control this block in Contentstack. Swap the copy, the image, or remove the section, then publish.", image: picture, image_side: "right", cta: button("Read the security notes", "/security", "secondary") } },
        { steps: { heading: "How a team ships", intro: "Three steps, from the first task to the status update.", items: [
          { title: "Capture", description: "Drop requests onto a board. The owner and the date sit on the card." },
          { title: "Sequence", description: "Lay the work on a timeline and mark what is waiting on someone else." },
          { title: "Report", description: "The dashboard updates from the board. Nobody rebuilds the slide." },
        ] } },
        ...quotesBlock,
        { cta_banner: { heading: "See it on a real account", text: "Walk through pricing, or talk to us about a pilot.", background: "gradient", cta: button("Talk to us", "/contact") } },
      ],
    },
    {
      title: "Solutions",
      url: "/solutions",
      seo: {
        meta_title: "Solutions | Lumio",
        meta_description: "How product, engineering, marketing, and operations teams use Lumio.",
      },
      sections: [
        { hero: { eyebrow: "Solutions", heading: "One workspace, different jobs to be done", subheading: "The same plan serves a product trio, an engineering group, a campaign team, and the operations lead who has to report on all three.", theme: "light", cta: button("See customer stories", "/customers") } },
        { feature_grid: { heading: "Who it is for", columns: "3", features: [
          feature("Product", "Keep the roadmap, the bets, and the launch checklist on one page.", "01"),
          feature("Engineering", "Sprint boards stay attached to the date the customer was promised.", "02"),
          feature("Marketing", "Campaign work sits next to the launch it supports, not in another tool.", "03"),
          feature("Operations", "Roll status up without asking every lead for a fresh update.", "04"),
          feature("Startups", "Start with boards and a timeline. Add reporting when the team grows.", "05"),
          feature("Mid-market", "Give each squad a workspace and leadership one view across them.", "06"),
          feature("Enterprise", "SSO, audit history, and a regional stack for teams that have to ask.", "07"),
        ] } },
        { split: { eyebrow: "Enterprise", heading: "A plan leadership can open without a briefing", body: "Enterprise teams use Lumio when the status meeting has become the work. Goals stay tied to the tasks, and the audit trail shows who moved a date.", image_side: "left", cta: button("Review security", "/security") } },
        { cta_banner: { heading: "Pick a starting point", text: "Most teams begin with one squad and a single roadmap.", background: "brand", cta: button("Compare plans", "/pricing") } },
      ],
    },
    {
      title: "Customers",
      url: "/customers",
      seo: {
        meta_title: "Customers | Lumio",
        meta_description: "How teams use Lumio to plan launches and report without the spreadsheet.",
      },
      sections: [
        { hero: { eyebrow: "Customers", heading: "The plan survives contact with the week", subheading: "These notes are sample stories for the demo. The quotes themselves are testimonials entries in Contentstack, referenced by this page.", theme: "light", cta: button("Look at the product", "/product") } },
        { stats: { heading: "What the sample teams report", items: [
          { value: "1", label: "roadmap instead of four decks" },
          { value: "30 min", label: "saved on the weekly status" },
          { value: "3", label: "teams sharing the same goals" },
          { value: "0", label: "spreadsheets rebuilt on Friday" },
        ] } },
        ...quotesBlock,
        { cta_banner: { heading: "Want the same shape for your own product?", text: "This page is one entry. Duplicate it, change the story, and publish.", background: "neutral", cta: button("Contact", "/contact") } },
      ],
    },
    {
      title: "Pricing",
      url: "/pricing",
      seo: {
        meta_title: "Pricing | Lumio",
        meta_description: "Starter, Growth, and Enterprise plans for the Lumio demo.",
      },
      sections: [
        { hero: { eyebrow: "Pricing", heading: "Start with a squad. Grow when the plan does.", subheading: "Prices below are sample content, edited in the Pricing block on this page.", theme: "light", cta: button("Ask for a pilot", "/contact") } },
        { pricing: { heading: "Plans", intro: "Every plan includes boards, timelines, and the published site you are looking at.", tiers: [
          { name: "Starter", price: "$0", cadence: "for a pilot", description: "For one team proving the workflow.", features: ["Up to 10 people", "Boards and timelines", "Community support"], featured: false, cta: button("Start a pilot", "/contact") },
          { name: "Growth", price: "$12", cadence: "per person / month", description: "For several squads that need one view.", features: ["Unlimited boards", "Goals and reporting", "SSO", "Priority support"], featured: true, cta: button("Talk to us", "/contact") },
          { name: "Enterprise", price: "Custom", cadence: "annual", description: "For teams that need a review before they buy.", features: ["Audit log", "Regional hosting", "Custom roles", "Success manager"], featured: false, cta: button("Contact sales", "/contact") },
        ] } },
        { faq: { heading: "Questions teams ask", items: [
          { question: "Can we change plans later?", answer: "Yes. Move from Starter to Growth when a second squad joins. The work stays where it is." },
          { question: "Do guests count as people?", answer: "Comment-only guests are free. People who edit the plan are on the bill." },
          { question: "Where does the content live?", answer: "This demo stack is in Contentstack's EU region. Product data in a real rollout would sit with your commerce or planning system." },
          { question: "Is this a live checkout?", answer: "No. Pricing is content. A production store would connect a commerce engine for cart and payment." },
        ] } },
        { cta_banner: { heading: "Bring one roadmap", text: "We will set the pilot up against a launch you already have.", background: "gradient", cta: button("Contact", "/contact") } },
      ],
    },
    {
      title: "About",
      url: "/about",
      seo: {
        meta_title: "About | Lumio",
        meta_description: "Lumio is a sample product site built as a Contentstack page model.",
      },
      sections: [
        { hero: { eyebrow: "About", heading: "A product site, assembled from entries", subheading: "Lumio is the sample brand. The pages, navigation, and footer are published content, which is the part worth showing.", theme: "light", cta: button("How the CMS is wired", "/contentstack", "secondary") } },
        { rich_text: { heading: "What you are looking at", body: "Each of these pages is a Page entry. A page has a URL and a stack of sections: hero, features, stats, pricing, questions, and a closing banner.\n\nAdding a page does not require a new template. Create an entry, set a URL such as /partners, add the sections, and publish it to staging. The site reads that URL and renders the blocks.\n\nThe homepage, header, footer, and mega menu are separate content types, so global chrome can change without editing every page." } },
        { stats: { items: [
          { value: "8", label: "sample pages in this stack" },
          { value: "11", label: "section types an editor can stack" },
          { value: "1", label: "template for every new URL" },
          { value: "EU", label: "Contentstack region for this stack" },
        ] } },
        { cta_banner: { heading: "Add the next page in the CMS", text: "Partners, careers, or a launch note. Same content type.", background: "brand", cta: button("See resources", "/resources") } },
      ],
    },
    {
      title: "Security",
      url: "/security",
      seo: {
        meta_title: "Security | Lumio",
        meta_description: "SSO, audit history, encryption, and EU hosting for the Lumio demo.",
      },
      sections: [
        { hero: { eyebrow: "Security", heading: "Controls a buyer expects to see", subheading: "This page is sample security content for the demo. It shows how a trust page is modeled, not a certification.", theme: "light", cta: button("Contact", "/contact") } },
        { feature_grid: { heading: "What the sample covers", columns: "2", features: [
          feature("SSO", "Sign-in through the company identity provider. People leave when the account does.", "01"),
          feature("Audit log", "A date move keeps the person and the time. Useful when a launch date is disputed.", "02"),
          feature("Encryption", "Data is encrypted in transit and at rest in the sample architecture.", "03"),
          feature("EU hosting", "This Contentstack stack runs in the EU region.", "04"),
        ] } },
        { faq: { heading: "Reviews", items: [
          { question: "Can we complete a security questionnaire?", answer: "For a real program, yes. This demo page is the content pattern, not the completed review." },
          { question: "Do you support a regional data store?", answer: "The CMS for this site is in the EU. A production app can keep its own data in the region you choose." },
        ] } },
        { cta_banner: { heading: "Ask for the review packet", text: "We will send the sample packet and walk the page model.", background: "neutral", cta: button("Contact", "/contact") } },
      ],
    },
    {
      title: "Resources",
      url: "/resources",
      seo: {
        meta_title: "Resources | Lumio",
        meta_description: "Guides, templates, and a walkthrough of how this site is built.",
      },
      sections: [
        { hero: { eyebrow: "Resources", heading: "Notes for the people running the plan", subheading: "Guides, templates, and the write-up of how this website is stored in Contentstack.", theme: "light", cta: button("Read the CMS notes", "/contentstack") } },
        { feature_grid: { heading: "From the library", columns: "3", features: [
          feature("Guides", "A short tour of boards, timelines, and the weekly status.", "→", "/product"),
          feature("Templates", "Start from a launch plan instead of an empty board.", "→", "/solutions"),
          feature("Webinars", "A 20-minute look at reporting for leads who will not open the tool.", "→", "/customers"),
          feature("How this site is built", "Content types, entries, and the delivery API behind these pages.", "→", "/contentstack"),
        ] } },
        { rich_text: { heading: "Publish another note", body: "A resource can be its own Page entry, with a URL like /resources/launch-checklist. Link it from this grid. The grid is a modular block, so the card list is content." } },
        { cta_banner: { heading: "Need the model, not the brochure?", text: "The Contentstack page explains the stack in plain language.", background: "brand", cta: button("Open the write-up", "/contentstack") } },
      ],
    },
    {
      title: "Contact",
      url: "/contact",
      seo: {
        meta_title: "Contact | Lumio",
        meta_description: "Talk to the team about a Lumio pilot.",
      },
      sections: [
        { hero: { eyebrow: "Contact", heading: "Tell us which launch you want to plan", subheading: "This is a sample contact page. It does not send email. The details are fields on the Contact block.", theme: "light" } },
        { contact: { heading: "Where to reach the demo team", intro: "Use this block for an office, an email, or a region. Add a row in Contentstack and publish.", details: [
          { label: "Email", value: "hello@lumio.example" },
          { label: "Region", value: "EU" },
          { label: "Response", value: "One business day on a real program" },
        ] } },
        { faq: { heading: "Before you write", items: [
          { question: "Can you add a page before the meeting?", answer: "Yes. A new Page entry, a URL, and a publish is enough. Refresh the site after it is published to staging." },
          { question: "Can the homepage change too?", answer: "The homepage is its own entry. Sections there use the same idea: blocks, in order, published." },
        ] } },
      ],
    },
  ];
}

const EXACT = {
  "/product/whats-new": "/product",
  "/product/timelines": "/product#timelines",
  "/product/ai": "/product#ai-summaries",
  "/product/boards": "/product#task-boards",
  "/product/roadmaps": "/product#roadmaps",
  "/product/goals": "/product#goals",
  "/product/plan": "/product",
  "/product/reporting": "/product#live-reporting",
  "/product/dashboards": "/product#dashboards",
  "/product/workload": "/product#workload",
  "/product/time": "/product#live-reporting",
  "/product/track": "/product",
  "/product/comments": "/product",
  "/product/docs": "/resources",
  "/product/approvals": "/product",
  "/product/features": "/product",
  "/integrations": "/product",
  "/integrations/slack": "/product",
  "/integrations/github": "/product",
  "/integrations/google-drive": "/product",
  "/integrations/jira": "/product",
  "/integrations/figma": "/product",
  "/solutions/launches": "/solutions#product",
  "/solutions/sprints": "/solutions#engineering",
  "/solutions/clients": "/solutions#operations",
  "/solutions/product": "/solutions#product",
  "/solutions/engineering": "/solutions#engineering",
  "/solutions/marketing": "/solutions#marketing",
  "/solutions/operations": "/solutions#operations",
  "/solutions/teams": "/solutions",
  "/solutions/startups": "/solutions#startups",
  "/solutions/mid-market": "/solutions#mid-market",
  "/solutions/enterprise": "/solutions#enterprise",
  "/templates": "/resources#templates",
  "/guides": "/resources#guides",
  "/webinars": "/resources#webinars",
  "/developers": "/resources",
};

const KNOWN_PAGES = new Set(["/product", "/solutions", "/customers", "/pricing", "/about", "/security", "/resources", "/contact", "/contentstack"]);

function remapHref(href) {
  if (!href || typeof href !== "string") return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//") || href.startsWith("mailto:") || href.startsWith("#")) return href;
  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const clean = pathPart.replace(/\/$/, "") || "/";
  if (EXACT[clean]) return EXACT[clean];
  if (hash && KNOWN_PAGES.has(clean)) return `${clean}${hash}`;
  if (clean.startsWith("/product")) return "/product";
  if (clean.startsWith("/solutions")) return "/solutions";
  if (clean.startsWith("/integrations")) return "/product";
  return href;
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
  // A GET returns a file field as the whole asset. A PUT only accepts the asset uid.
  if (isAsset(node)) return node.uid;
  const next = {};
  for (const [key, value] of Object.entries(node)) {
    next[key] = key === "href" && typeof value === "string" ? remapHref(value) : walk(value);
  }
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

const NAV = [
  ["product", "/product"],
  ["solutions", "/solutions"],
  ["customers", "/customers"],
  ["customer stories", "/customers"],
  ["pricing", "/pricing"],
  ["resources", "/resources"],
  ["about", "/about"],
  ["company", "/about"],
  ["security", "/security"],
  ["contact", "/contact"],
];

function ensureHeader(entry) {
  const next = walk(contentFields(entry));
  const items = Array.isArray(next.nav_items) ? next.nav_items : [];
  for (const item of items) {
    const target = NAV.find(([label]) => label === String(item.label ?? "").trim().toLowerCase())?.[1];
    if (!target) continue;
    const href = item.link?.href ?? "";
    if (!href || href.startsWith("/") || href === "#") {
      item.link = { ...(item.link ?? {}), title: item.link?.title || item.label, href: target };
    }
  }
  const labels = new Set(items.map((item) => String(item.label ?? "").trim().toLowerCase()));
  for (const [label, href] of [["Customers", "/customers"], ["Pricing", "/pricing"], ["Resources", "/resources"]]) {
    if (labels.has(label.toLowerCase())) continue;
    items.push({ label, link: { title: label, href }, new_tab: false });
  }
  next.nav_items = items;
  const ctaHref = next.cta?.url?.href ?? "";
  if (!ctaHref || ctaHref === "#" || /^\/(signup|trial|get-started|register|demo)(\/|$)/.test(ctaHref)) {
    next.cta = { ...(next.cta ?? {}), url: { ...(next.cta?.url ?? {}), title: next.cta?.url?.title || "Contact", href: "/contact" } };
  }
  return next;
}

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
  const existing = await cma("GET", "/content_types/page");
  const result = existing.ok
    ? await cma("PUT", "/content_types/page", { content_type: contentType })
    : await cma("POST", "/content_types", { content_type: contentType });
  if (!result.ok) fail("Saving page content type", result);
  console.log(`Content type page ${existing.ok ? "updated" : "created"}.`);
}

async function publish(contentTypeUid, uid, label) {
  const published = await cma("POST", `/content_types/${contentTypeUid}/entries/${uid}/publish`, {
    entry: { environments: [environment], locales: [locale] },
  });
  if (!published.ok) fail(`Publishing "${label}"`, published);
}

async function upsertByQuery(contentTypeUid, entry, query) {
  const found = await cma("GET", `/content_types/${contentTypeUid}/entries?locale=${locale}&query=${encodeURIComponent(JSON.stringify(query))}`);
  if (!found.ok) fail(`Finding ${contentTypeUid} entry`, found);
  const existingUid = found.data.entries?.[0]?.uid;
  const saved = existingUid
    ? await cma("PUT", `/content_types/${contentTypeUid}/entries/${existingUid}?locale=${locale}`, { entry })
    : await cma("POST", `/content_types/${contentTypeUid}/entries?locale=${locale}`, { entry });
  if (!saved.ok) fail(`Saving "${entry.title}"`, saved);
  const uid = saved.data.entry.uid;
  await publish(contentTypeUid, uid, entry.title);
  console.log(`${contentTypeUid} "${entry.title}" ${existingUid ? "updated" : "created"} and published to ${environment}.`);
}

async function patchSingleton(contentTypeUid, mutate) {
  const found = await cma("GET", `/content_types/${contentTypeUid}/entries?locale=${locale}`);
  if (!found.ok) fail(`Loading ${contentTypeUid}`, found);
  const current = found.data.entries?.[0];
  if (!current) {
    console.log(`No ${contentTypeUid} entry to update.`);
    return;
  }
  const entry = mutate(current);
  const saved = await cma("PUT", `/content_types/${contentTypeUid}/entries/${current.uid}?locale=${locale}`, { entry });
  if (!saved.ok) fail(`Saving ${contentTypeUid}`, saved);
  await publish(contentTypeUid, current.uid, contentTypeUid);
  console.log(`${contentTypeUid} updated and published.`);
}

await upsertContentType();

const quotesResult = await cma("GET", `/content_types/testimonials/entries?locale=${locale}`);
const quotes = (quotesResult.data.entries ?? []).slice(0, 3).map((entry) => ({
  uid: entry.uid,
  _content_type_uid: "testimonials",
}));

const imageUid = await findPromoAssetUid();
for (const entry of samplePages(imageUid, quotes)) {
  await upsertByQuery("page", entry, { url: entry.url });
}

for (const entry of sampleEntries(imageUid)) {
  await upsertByQuery("mega_menu", entry, { title: entry.title });
}

await patchSingleton("header", ensureHeader);
await patchSingleton("footer", (entry) => walk(contentFields(entry)));

console.log("Pages are published. Add another one in Contentstack with a URL such as /partners, then refresh the site.");

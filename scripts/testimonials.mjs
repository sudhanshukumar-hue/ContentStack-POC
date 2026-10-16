// Extra testimonials for the Lumio demo. Names and companies are fictional.

function avatarSvg(initials, color) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="40" fill="${color}"/>
  <text x="40" y="48" text-anchor="middle" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700">${initials}</text>
</svg>`;
}

export const extraTestimonials = [
  {
    author_name: "Amina Diallo",
    role: "Product Lead, Helio",
    quote: "Campaign dates and the launch sit on one timeline. We stopped reconciling two calendars on Thursday.",
    initials: "AD",
    color: "#1d4ed8",
  },
  {
    author_name: "Jonah Ellis",
    role: "Engineering Manager, Fieldnote",
    quote: "The second squad joined without a new tool. Their board is on the same plan as the first.",
    initials: "JE",
    color: "#0f766e",
  },
  {
    author_name: "Rosa Nguyen",
    role: "Operations Lead, Copperlane",
    quote: "Each squad keeps its workspace. I open one view when leadership asks where the week stands.",
    initials: "RN",
    color: "#9a3412",
  },
  {
    author_name: "Samir Kapoor",
    role: "Director of Product, Marlowe",
    quote: "Goals stay on the tasks. I stopped writing a briefing just so the plan could be read.",
    initials: "SK",
    color: "#6d28d9",
  },
  {
    author_name: "Lena Voss",
    role: "Marketing Manager, Kite & Co",
    quote: "Status comes from the work. The Friday spreadsheet is closed, and the numbers still match.",
    initials: "LV",
    color: "#334155",
  },
  {
    author_name: "Owen Blake",
    role: "Program Manager, Lumenary",
    quote: "When a date moves, the audit trail shows who moved it. That ended the argument in the status meeting.",
    initials: "OB",
    color: "#1e3a8a",
  },
];

const preferredOrder = [
  "Priya Sharma",
  "Daniel Okafor",
  "Mei Tanaka",
  ...extraTestimonials.map((item) => item.author_name),
];

function pickField(schema, candidates) {
  const wanted = new Set(candidates);
  return schema.find((field) => wanted.has(field.uid) || wanted.has(String(field.display_name ?? "").toLowerCase().replace(/\s+/g, "_")));
}

function rank(name) {
  const index = preferredOrder.indexOf(name);
  return index === -1 ? preferredOrder.length : index;
}

async function uploadAvatar({ apiHost, apiKey, managementToken, environment, locale, cma }, person) {
  const title = `${person.author_name} avatar`;
  const query = encodeURIComponent(JSON.stringify({ title }));
  const found = await cma("GET", `/assets?query=${query}`);
  if (!found.ok) {
    throw new Error(`Finding avatar "${title}" failed (${found.status}): ${found.data.error_message ?? JSON.stringify(found.data)}`);
  }
  const form = new FormData();
  form.append("asset[upload]", new Blob([avatarSvg(person.initials, person.color)], { type: "image/svg+xml" }), `${person.initials.toLowerCase()}-avatar.svg`);
  form.append("asset[title]", title);
  form.append("asset[description]", "Original initials portrait for the Lumio demo.");
  const existingUid = found.data.assets?.[0]?.uid;
  const response = await fetch(`https://${apiHost}/v3/assets${existingUid ? `/${existingUid}` : ""}`, {
    method: existingUid ? "PUT" : "POST",
    headers: { api_key: apiKey, authorization: managementToken },
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Saving avatar "${title}" failed (${response.status}): ${data.error_message ?? JSON.stringify(data)}`);
  }
  const uid = data.asset.uid;
  const published = await cma("POST", `/assets/${uid}/publish`, {
    asset: { environments: [environment], locales: [locale] },
  });
  if (!published.ok) {
    throw new Error(`Publishing avatar "${title}" failed (${published.status}): ${published.data.error_message ?? JSON.stringify(published.data)}`);
  }
  return uid;
}

function avatarValue(field, uid, alt) {
  if (!field || !uid) return undefined;
  if (field.data_type === "file") return uid;
  if (field.data_type === "group") {
    const fileField = field.schema?.find((child) => child.data_type === "file");
    const altField = field.schema?.find((child) => child.uid === "alt");
    if (!fileField) return undefined;
    return { [fileField.uid]: uid, ...(altField ? { [altField.uid]: alt } : {}) };
  }
  return undefined;
}

const SYSTEM = new Set([
  "uid", "created_at", "updated_at", "created_by", "updated_by", "_version", "ACL",
  "publish_details", "_in_progress", "locale", "_metadata", "_branch", "_workflow",
  "_restore_status", "_version_name", "stackHeaders",
]);

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

function contentFields(entry) {
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    if (!SYSTEM.has(key)) out[key] = value;
  }
  return out;
}

export async function ensureTestimonials({ apiHost, apiKey, managementToken, environment, locale, cma }) {
  const type = await cma("GET", "/content_types/testimonials");
  if (!type.ok) {
    throw new Error(`Loading testimonials content type failed (${type.status}): ${type.data.error_message ?? JSON.stringify(type.data)}`);
  }
  const schema = type.data.content_type?.schema ?? [];
  const titleField = pickField(schema, ["title"]);
  const quoteField = pickField(schema, ["quote", "quotation", "testimonial", "comment"]);
  const authorField = pickField(schema, ["author_name", "author", "name", "customer_name"]);
  const roleField = pickField(schema, ["role", "designation", "job_title", "position"]);
  const avatarField = pickField(schema, ["avatar", "image", "photo", "picture", "author_image"]);
  if (!quoteField || !authorField) {
    throw new Error(`Testimonials schema is missing a quote or author field. Fields: ${schema.map((field) => field.uid).join(", ")}`);
  }

  const found = await cma("GET", `/content_types/testimonials/entries?locale=${locale}&limit=100`);
  if (!found.ok) {
    throw new Error(`Loading testimonials failed (${found.status}): ${found.data.error_message ?? JSON.stringify(found.data)}`);
  }
  const existing = found.data.entries ?? [];
  const byAuthor = new Map(existing.map((entry) => [entry[authorField.uid], entry]));

  async function publish(uid, label) {
    const published = await cma("POST", `/content_types/testimonials/entries/${uid}/publish`, {
      entry: { environments: [environment], locales: [locale] },
    });
    if (!published.ok) {
      throw new Error(`Publishing "${label}" failed (${published.status}): ${published.data.error_message ?? JSON.stringify(published.data)}`);
    }
  }

  for (const person of extraTestimonials) {
    const current = byAuthor.get(person.author_name);
    const avatarUid = avatarField
      ? await uploadAvatar({ apiHost, apiKey, managementToken, environment, locale, cma }, person)
      : undefined;
    const avatar = avatarValue(avatarField, avatarUid, person.author_name) ?? (avatarUid ? { image: avatarUid } : undefined);
    if (current) {
      const hasAvatar = current[avatarField?.uid]?.image || current[avatarField?.uid]?.url || current[avatarField?.uid]?.uid;
      if (hasAvatar || !avatar) {
        console.log(`Testimonial "${person.author_name}" already exists.`);
        continue;
      }
      const entry = walk(contentFields(current));
      entry[avatarField.uid] = avatar;
      const saved = await cma("PUT", `/content_types/testimonials/entries/${current.uid}?locale=${locale}`, { entry });
      if (!saved.ok) {
        throw new Error(`Updating "${person.author_name}" failed (${saved.status}): ${saved.data.error_message ?? JSON.stringify(saved.data.errors ?? saved.data)}`);
      }
      await publish(current.uid, person.author_name);
      byAuthor.set(person.author_name, saved.data.entry);
      console.log(`Testimonial "${person.author_name}" avatar added.`);
      continue;
    }
    const entry = {
      [quoteField.uid]: person.quote,
      [authorField.uid]: person.author_name,
    };
    if (titleField) entry[titleField.uid] = person.author_name;
    if (roleField) entry[roleField.uid] = person.role;
    if (avatarField && avatar) entry[avatarField.uid] = avatar;
    const saved = await cma("POST", `/content_types/testimonials/entries?locale=${locale}`, { entry });
    if (!saved.ok) {
      throw new Error(`Saving "${person.author_name}" failed (${saved.status}): ${saved.data.error_message ?? JSON.stringify(saved.data.errors ?? saved.data)}`);
    }
    const uid = saved.data.entry.uid;
    await publish(uid, person.author_name);
    byAuthor.set(person.author_name, saved.data.entry);
    console.log(`Testimonial "${person.author_name}" created and published to ${environment}.`);
  }

  const quotes = [...byAuthor.values()].sort((a, b) => rank(a[authorField.uid]) - rank(b[authorField.uid]));
  const refs = quotes.map((entry) => ({ uid: entry.uid, _content_type_uid: "testimonials" }));

  for (const contentTypeUid of ["page", "home_page"]) {
    const pages = await cma("GET", `/content_types/${contentTypeUid}/entries?locale=${locale}&limit=100`);
    if (!pages.ok) continue;
    for (const current of pages.data.entries ?? []) {
      const next = walk(contentFields(current));
      const blocks = Array.isArray(next.sections) ? next.sections : [];
      const hasQuotes = blocks.some((block) => block?.testimonials);
      if (!hasQuotes) continue;
      for (const block of blocks) {
        if (block?.testimonials) block.testimonials.reference = refs;
      }
      const saved = await cma("PUT", `/content_types/${contentTypeUid}/entries/${current.uid}?locale=${locale}`, { entry: next });
      if (!saved.ok) {
        throw new Error(`Saving ${contentTypeUid} "${current.title}" failed (${saved.status}): ${saved.data.error_message ?? JSON.stringify(saved.data.errors ?? saved.data)}`);
      }
      const published = await cma("POST", `/content_types/${contentTypeUid}/entries/${current.uid}/publish`, {
        entry: { environments: [environment], locales: [locale] },
      });
      if (!published.ok) {
        throw new Error(`Publishing ${contentTypeUid} "${current.title}" failed (${published.status}): ${published.data.error_message ?? JSON.stringify(published.data)}`);
      }
      console.log(`${contentTypeUid} "${current.title}" now references ${refs.length} testimonials.`);
    }
  }

  return quotes.map((entry) => ({ uid: entry.uid, _content_type_uid: "testimonials" }));
}

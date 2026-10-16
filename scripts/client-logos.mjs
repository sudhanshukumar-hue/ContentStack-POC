// Original logo marks for the Lumio demo. These are not third-party trademarks.

const ink = "#334155";

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function wordmark(name, icon) {
  const textWidth = Math.ceil(name.length * 8.6);
  const width = 42 + textWidth;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="36" viewBox="0 0 ${width} 36">
  ${icon}
  <text x="40" y="23" fill="${ink}" font-family="Georgia, 'Times New Roman', serif" font-size="15" font-weight="700">${escapeXml(name)}</text>
</svg>`;
}

const icon = {
  northwind: `<circle cx="16" cy="18" r="11" fill="none" stroke="${ink}" stroke-width="1.6"/>
    <path d="M16 8.5 L19 18 L16 16.2 L13 18 Z" fill="${ink}"/>
    <path d="M16 27.5 L13 18 L16 19.8 L19 18 Z" fill="${ink}" opacity=".35"/>`,
  helio: `<circle cx="16" cy="18" r="5.5" fill="${ink}"/>
    <g stroke="${ink}" stroke-width="1.6" stroke-linecap="round">
      <path d="M16 6.5 V9.5 M16 26.5 V29.5 M6.5 18 H9.5 M22.5 18 H25.5 M9.2 11.2 L11.3 13.3 M20.7 22.7 L22.8 24.8 M22.8 11.2 L20.7 13.3 M11.3 22.7 L9.2 24.8"/>
    </g>`,
  brightline: `<path d="M5 18 H27" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="16" cy="18" r="3.2" fill="${ink}"/>`,
  kite: `<path d="M16 6 L26 18 L16 30 L6 18 Z" fill="none" stroke="${ink}" stroke-width="1.6"/>
    <path d="M16 6 L16 30 M6 18 H26" stroke="${ink}" stroke-width="1" opacity=".45"/>`,
  marlowe: `<rect x="5" y="7" width="22" height="22" rx="4" fill="none" stroke="${ink}" stroke-width="1.6"/>
    <path d="M10 24 V12 L16 19 L22 12 V24" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linejoin="round"/>`,
  fieldnote: `<rect x="7" y="6" width="18" height="24" rx="2" fill="none" stroke="${ink}" stroke-width="1.6"/>
    <path d="M11 13 H21 M11 18 H21 M11 23 H17" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`,
  copperlane: `<circle cx="12" cy="18" r="7" fill="none" stroke="${ink}" stroke-width="1.6"/>
    <circle cx="20" cy="18" r="7" fill="none" stroke="${ink}" stroke-width="1.6"/>`,
  lumenary: `<path d="M16 7 L18.2 14.2 L26 16 L18.2 17.8 L16 25 L13.8 17.8 L6 16 L13.8 14.2 Z" fill="${ink}"/>`,
};

export const clientLogos = [
  { name: "Northwind", filename: "northwind.svg", industry: "Product", description: "Three squads share one roadmap. A slipped date shows on the board before the Monday meeting.", svg: wordmark("Northwind", icon.northwind) },
  { name: "Helio", filename: "helio.svg", industry: "Marketing", description: "Campaign work sits on the same timeline as the launch it supports.", svg: wordmark("Helio", icon.helio) },
  { name: "Brightline", filename: "brightline.svg", industry: "Engineering", description: "Sprint boards stay attached to the date the customer was promised.", svg: wordmark("Brightline", icon.brightline) },
  { name: "Kite & Co", filename: "kite-and-co.svg", industry: "Operations", description: "Status comes from the work, so the Friday spreadsheet stayed closed.", svg: wordmark("Kite & Co", icon.kite) },
  { name: "Marlowe", filename: "marlowe.svg", industry: "Product", description: "Goals stay tied to the tasks. Leadership opens the plan without a briefing.", svg: wordmark("Marlowe", icon.marlowe) },
  { name: "Fieldnote", filename: "fieldnote.svg", industry: "Startup", description: "Started with boards and a timeline, then added reporting when a second squad joined.", svg: wordmark("Fieldnote", icon.fieldnote) },
  { name: "Copperlane", filename: "copperlane.svg", industry: "Mid-market", description: "Each squad has a workspace. Leadership has one view across them.", svg: wordmark("Copperlane", icon.copperlane) },
  { name: "Lumenary", filename: "lumenary.svg", industry: "Enterprise", description: "SSO and an audit trail for teams that have to show who moved a date.", svg: wordmark("Lumenary", icon.lumenary) },
];

async function assetRequest(apiHost, apiKey, managementToken, method, path, form) {
  const response = await fetch(`https://${apiHost}/v3${path}`, {
    method,
    headers: { api_key: apiKey, authorization: managementToken },
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function formFor(logo) {
  const form = new FormData();
  form.append("asset[upload]", new Blob([logo.svg], { type: "image/svg+xml" }), logo.filename);
  form.append("asset[title]", `${logo.name} logo`);
  form.append("asset[description]", "Original logo mark created for the Lumio demo.");
  return form;
}

export async function uploadClientLogos({ apiHost, apiKey, managementToken, environment, locale, cma }) {
  const uids = {};
  for (const logo of clientLogos) {
    const title = `${logo.name} logo`;
    const query = encodeURIComponent(JSON.stringify({ title }));
    const found = await cma("GET", `/assets?query=${query}`);
    if (!found.ok) {
      throw new Error(`Finding asset "${title}" failed (${found.status}): ${found.data.error_message ?? JSON.stringify(found.data)}`);
    }
    const existingUid = found.data.assets?.[0]?.uid;
    const saved = existingUid
      ? await assetRequest(apiHost, apiKey, managementToken, "PUT", `/assets/${existingUid}`, formFor(logo))
      : await assetRequest(apiHost, apiKey, managementToken, "POST", "/assets", formFor(logo));
    if (!saved.ok) {
      throw new Error(`Saving asset "${title}" failed (${saved.status}): ${saved.data.error_message ?? JSON.stringify(saved.data)}`);
    }
    const uid = saved.data.asset.uid;
    const published = await cma("POST", `/assets/${uid}/publish`, {
      asset: { environments: [environment], locales: [locale] },
    });
    if (!published.ok) {
      throw new Error(`Publishing asset "${title}" failed (${published.status}): ${published.data.error_message ?? JSON.stringify(published.data)}`);
    }
    uids[logo.name] = uid;
    console.log(`Asset "${title}" ${existingUid ? "updated" : "created"} and published.`);
  }
  return uids;
}

export function logoFields(uids = {}) {
  return clientLogos.map(({ name, industry, description }) => ({
    name,
    industry,
    description,
    ...(uids[name] ? { logo: uids[name] } : {}),
  }));
}

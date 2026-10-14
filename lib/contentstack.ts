import contentstack, { Region } from "@contentstack/delivery-sdk";

type HomePageEntry = {
  title?: string;
  sections?: Record<string, unknown>[];
};

export type ContentstackLink = {
  title?: string;
  href?: string;
};

export type HeaderEntry = {
  title?: string;
  announcement?: {
    show_banner?: boolean;
    text?: string;
    link?: ContentstackLink;
  };
  logo?: {
    image?: { url?: string } | null;
    alt?: string;
  };
  logo_link?: ContentstackLink;
  nav_items?: {
    label?: string;
    link?: ContentstackLink;
    new_tab?: boolean;
    children?: {
      label?: string;
      link?: ContentstackLink;
      description?: string;
    }[];
  }[];
  cta?: {
    label?: string;
    url?: ContentstackLink;
    style?: string;
    style_variant?: string;
  };
  sticky_headder?: boolean;
  theme?: string;
};

export const stack = contentstack.stack({
  apiKey: process.env.CONTENTSTACK_API_KEY!,
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT!,
  region: (process.env.CONTENTSTACK_REGION as Region) ?? Region.US,
});

export type FooterEntry = {
  title?: string;
  logo?: {
    image?: { url?: string } | null;
    alt?: string;
  };
  tagline?: string;
  newsletter?: {
    show_newsletter?: boolean;
    heading?: string;
    description?: string;
    button_label?: string;
  };
  link_columns?: {
    column_heading?: string;
    links?: {
      label?: string;
      link?: ContentstackLink;
      open_in_new_tab?: boolean;
    }[];
  }[];
  social_links?: {
    platform?: string;
    url?: ContentstackLink;
  }[];
  legal_links?: {
    label?: string;
    link?: ContentstackLink;
  }[];
  copyright_text?: string;
  theme?: string;
};

export type MegaMenuEntry = {
  uid?: string;
  title?: string;
  order?: number;
  link?: ContentstackLink;
  columns?: {
    sections?: {
      heading?: string;
      links?: ContentstackLink[];
    }[];
    promo_image?: { url?: string } | null;
    promo_link?: ContentstackLink;
    footer_link?: ContentstackLink;
  }[];
};

export async function getMegaMenus() {
  try {
    const result = await stack.contentType("mega_menu").entry().find<MegaMenuEntry>();
    return [...(result.entries ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    // The mega_menu content type may not exist yet; the navbar falls back to header dropdowns.
    return [];
  }
}

export async function getHeader() {
  const result = await stack.contentType("header").entry().find<HeaderEntry>();
  return result.entries?.[0] ?? null;
}

export async function getFooter() {
  const result = await stack.contentType("footer").entry().find<FooterEntry>();
  return result.entries?.[0] ?? null;
}

export type PageEntry = {
  uid?: string;
  title?: string;
  url?: string;
  seo?: { meta_title?: string; meta_description?: string };
  sections?: Record<string, unknown>[];
};

export async function getPages() {
  try {
    const result = await stack
      .contentType("page")
      .entry()
      .includeReference(["sections.testimonials.reference"])
      .find<PageEntry>();
    return result.entries ?? [];
  } catch {
    return [];
  }
}

export async function getPageByPath(path: string) {
  const clean = `/${path.split("/").filter(Boolean).join("/")}`;
  const pages = await getPages();
  return (
    pages.find((page) => page.url === clean || page.url === `${clean}/`) ??
    null
  );
}

export async function getHomePage() {
  const result = await stack
    .contentType("home_page")
    .entry()
    .includeReference(["sections.testimonials.reference"])
    .find<HomePageEntry>();

  return result.entries?.[0] ?? null;
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer from "@/src/components/BlockRenderer";
import { getPageByPath, getPages } from "@/lib/contentstack";
import { withBase } from "@/lib/paths";

type PageParams = { params: Promise<{ slug: string[] }> };

function toPath(slug: string[]) {
  return `/${slug.filter(Boolean).join("/")}`;
}

const sampleClients = {
  clients: {
    heading: "Our clients",
    logos: [
      { name: "Northwind" },
      { name: "Helio" },
      { name: "Brightline" },
      { name: "Kite & Co" },
      { name: "Marlowe" },
      { name: "Fieldnote" },
      { name: "Copperlane" },
      { name: "Lumenary" },
    ],
  },
};

function withClientStrip(path: string, blocks?: Record<string, unknown>[]) {
  const sections = blocks ?? [];
  if (path !== "/product" || sections.some((block) => "clients" in block)) return sections;
  const heroAt = sections.findIndex((block) => "hero" in block);
  const at = heroAt === -1 ? 0 : heroAt + 1;
  return [...sections.slice(0, at), sampleClients, ...sections.slice(at)];
}

export async function generateStaticParams() {
  const pages = await getPages();
  const params = pages
    .map((page) => page.url?.split("/").filter(Boolean) ?? [])
    .filter((slug) => slug.length > 0)
    .map((slug) => ({ slug }));

  // Cache Components rejects an empty list. Product is the first sample page.
  return params.length > 0 ? params : [{ slug: ["product"] }];
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageByPath(toPath(slug));
  if (!page) return { title: "Page not found" };
  return {
    title: page.seo?.meta_title || page.title || "Lumio",
    description: page.seo?.meta_description,
  };
}

async function PageContent({ params }: PageParams) {
  const { slug } = await params;
  const page = await getPageByPath(toPath(slug));
  if (!page) notFound();

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <div className="container">
          <a href={withBase("/")}>Home</a>
          <span aria-hidden="true">/</span>
          <span>{page.title}</span>
        </div>
      </nav>
      <BlockRenderer blocks={withClientStrip(toPath(slug), page.sections)} />
    </>
  );
}

export default function CmsPage({ params }: PageParams) {
  return (
    <Suspense fallback={<p className="container page-loading">Loading page…</p>}>
      <PageContent params={params} />
    </Suspense>
  );
}

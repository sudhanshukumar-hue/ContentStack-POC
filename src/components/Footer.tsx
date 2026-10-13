import { getFooter, type ContentstackLink } from "@/lib/contentstack";
import { withBase } from "@/lib/paths";
import NewsletterForm from "./NewsletterForm";

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  github: "GitHub",
};

function SocialLogo({ platform }: { platform: string }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false };
  if (platform === "linkedin") {
    return (
      <svg {...common}>
        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.84v2.12h.05c.53-1.01 1.84-2.08 3.79-2.08 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.71c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
      </svg>
    );
  }
  if (platform === "x") {
    return (
      <svg {...common}>
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-4.71-6.23-5.4 6.23H2.73l7.73-8.84L2.25 2.25h6.83l4.25 5.62 4.91-5.62zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
      </svg>
    );
  }
  if (platform === "github") {
    return (
      <svg {...common}>
        <path d="M12 .5C5.65.5.5 5.65.5 12.05c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12.05C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    );
  }
  return null;
}

function linkProps(link?: ContentstackLink, newTab?: boolean) {
  if (!link?.href) return null;
  return {
    href: withBase(link.href),
    ...(newTab ? { target: "_blank", rel: "noreferrer" } : {}),
  };
}

export default async function Footer() {
  const footer = await getFooter();
  if (!footer) return null;

  const theme = footer.theme?.toLowerCase() === "light" ? "light" : "dark";

  return (
    <footer className="site-footer" data-theme={theme}>
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            {footer.logo?.image?.url && (
              <img src={footer.logo.image.url} alt={footer.logo.alt ?? ""} className="footer__logo" />
            )}
            {footer.tagline && <p>{footer.tagline}</p>}
            {!!footer.social_links?.length && (
              <ul className="footer__social">
                {footer.social_links.map((item) => {
                  const props = linkProps(item.url, true);
                  if (!props || !item.platform) return null;
                  const platform = item.platform.toLowerCase();
                  const label = platformLabels[platform] ?? item.platform;
                  return (
                    <li key={item.platform}>
                      <a {...props} aria-label={label}>
                        <SocialLogo platform={platform} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {footer.newsletter?.show_newsletter && (
            <NewsletterForm
              heading={footer.newsletter.heading}
              description={footer.newsletter.description}
              buttonLabel={footer.newsletter.button_label}
            />
          )}
        </div>

        {!!footer.link_columns?.length && (
          <div className="footer__columns">
            {footer.link_columns.map((column) => (
              <section key={column.column_heading}>
                {column.column_heading && <h2>{column.column_heading}</h2>}
                <ul>
                  {column.links?.map((item) => {
                    const props = linkProps(item.link, item.open_in_new_tab);
                    if (!props) return null;
                    return (
                      <li key={item.label}>
                        <a {...props}>{item.label}</a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="footer__bottom">
          {footer.copyright_text && <p>{footer.copyright_text}</p>}
          {!!footer.legal_links?.length && (
            <ul className="footer__legal">
              {footer.legal_links.map((item) => {
                const props = linkProps(item.link);
                if (!props) return null;
                return (
                  <li key={item.label}>
                    <a {...props}>{item.label}</a>
                  </li>
                );
              })}
            </ul>
          )}
          <a href={withBase("/contentstack/")}>How this site uses Contentstack</a>
        </div>
      </div>
    </footer>
  );
}

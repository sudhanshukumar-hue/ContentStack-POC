import type { CSSProperties } from "react";
import {
  getHeader,
  getMegaMenus,
  type ContentstackLink,
  type HeaderEntry,
  type MegaMenuEntry,
} from "@/lib/contentstack";
import { withBase } from "@/lib/paths";
import MegaSlider from "./MegaSlider";

type NavItem = NonNullable<HeaderEntry["nav_items"]>[number];

function linkProps(link?: ContentstackLink, newTab?: boolean) {
  if (!link?.href) return null;
  return {
    href: withBase(link.href),
    ...(newTab ? { target: "_blank", rel: "noreferrer" } : {}),
  };
}

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

export default async function Navbar() {
  const [header, megaMenus] = await Promise.all([getHeader(), getMegaMenus()]);
  if (!header) return null;
  return <HeaderBar header={header} megaMenus={megaMenus} />;
}

function HeaderBar({ header, megaMenus }: { header: HeaderEntry; megaMenus: MegaMenuEntry[] }) {
  const logoHref = withBase(header.logo_link?.href || "/");
  const ctaProps = linkProps(header.cta?.url);
  const ctaStyle = (header.cta?.style ?? header.cta?.style_variant ?? "primary").toLowerCase();
  const announcement = header.announcement;
  const theme = header.theme?.toLowerCase() === "dark" ? "dark" : "light";

  const navItems = header.nav_items ?? [];
  const headerLabels = new Set(navItems.map((item) => normalize(item.label)));
  const unmatchedMenus = megaMenus.filter((menu) => !headerLabels.has(normalize(menu.title)));
  const menuFor = (label?: string) => megaMenus.find((menu) => normalize(menu.title) === normalize(label));

  return (
    <header
      className={`site-header${header.sticky_headder ? " site-header--sticky" : ""}`}
      data-theme={theme}
    >
      {announcement?.show_banner && announcement.text && (
        <div className="announce">
          <div className="container">
            {announcement.link?.href ? (
              <a href={withBase(announcement.link.href)}>{announcement.text}</a>
            ) : (
              <p>{announcement.text}</p>
            )}
          </div>
        </div>
      )}
      <div className="nav container">
        <a className="nav__logo" href={logoHref}>
          {header.logo?.image?.url ? (
            <img src={header.logo.image.url} alt={header.logo.alt ?? header.logo_link?.title ?? ""} />
          ) : (
            <span>{header.logo_link?.title || header.title}</span>
          )}
        </a>
        <input id="nav-toggle" className="nav__toggle" type="checkbox" />
        <label className="nav__backdrop" htmlFor="nav-toggle" aria-hidden="true" />
        <label className="nav__burger" htmlFor="nav-toggle">
          Menu
        </label>
        <nav className="nav__links" aria-label="Primary">
          <ul className="nav__list">
            {navItems.map((item) => {
              const menu = menuFor(item.label);
              if (menu) return <MegaItem key={item.label} menu={menu} item={item} />;
              return <NavListItem key={item.label} item={item} />;
            })}
            {unmatchedMenus.map((menu) => (
              <MegaItem key={menu.uid ?? menu.title} menu={menu} />
            ))}
          </ul>
        </nav>
        {header.cta?.label && ctaProps && (
          <a className={`btn btn--${ctaStyle} nav__cta`} {...ctaProps}>
            {header.cta.label}
          </a>
        )}
      </div>
    </header>
  );
}

function NavListItem({ item }: { item: NavItem }) {
  const children = item.children?.filter((child) => child.link?.href) ?? [];
  const itemLink = linkProps(item.link, item.new_tab);

  if (children.length > 0) {
    return (
      <li className="nav__item nav__item--sub">
        {itemLink ? (
          <a className="nav__link" {...itemLink}>
            {item.label}
          </a>
        ) : (
          <span className="nav__link">{item.label}</span>
        )}
        <div className="nav__panel">
          {children.map((child) => (
            <a key={child.label} className="nav__child" href={withBase(child.link?.href)}>
              <strong>{child.label}</strong>
              {child.description && <small>{child.description}</small>}
            </a>
          ))}
        </div>
      </li>
    );
  }

  if (!itemLink) return null;
  return (
    <li className="nav__item">
      <a className="nav__link" {...itemLink}>
        {item.label}
      </a>
    </li>
  );
}

function MegaItem({ menu, item }: { menu: MegaMenuEntry; item?: NavItem }) {
  const label = item?.label || menu.title;
  const itemLink = linkProps(menu.link?.href ? menu.link : item?.link, item?.new_tab);
  const columns = menu.columns ?? [];
  const hasFooter = columns.some((column) => column.footer_link?.href);
  const gridStyle = { "--mega-rest": Math.max(columns.length - 1, 1) } as CSSProperties;

  return (
    <li className="nav__item nav__item--mega">
      {itemLink ? (
        <a className="nav__link" {...itemLink}>
          {label}
        </a>
      ) : (
        <span className="nav__link" tabIndex={0}>
          {label}
        </span>
      )}
      <div className="mega">
        <div className="mega__inner">
          <div className="mega__grid" style={gridStyle}>
            {columns.map((column, index) => (
              <div key={index} className="mega__col">
                {column.sections?.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mega__section">
                    {section.heading && <p className="mega__heading">{section.heading}</p>}
                    {!!section.links?.length && (
                      <ul className="mega__links">
                        {section.links
                          .filter((link) => link.href)
                          .map((link) => (
                            <li key={`${link.title}-${link.href}`}>
                              <a href={withBase(link.href)}>{link.title}</a>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
                {column.promo_image?.url && (
                  <a className="mega__promo" href={withBase(column.promo_link?.href || "#")}>
                    <img src={column.promo_image.url} alt={column.promo_link?.title ?? ""} />
                    {column.promo_link?.title && <span>{column.promo_link.title}</span>}
                  </a>
                )}
              </div>
            ))}
          </div>
          {!!menu.slides?.length && <MegaSlider slides={menu.slides} label={label ?? "Menu"} />}
          {hasFooter && (
            <div className="mega__grid mega__footer" style={gridStyle}>
              {columns.map((column, index) =>
                column.footer_link?.href ? (
                  <a key={index} href={withBase(column.footer_link.href)}>
                    {column.footer_link.title}
                  </a>
                ) : (
                  <span key={index} />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

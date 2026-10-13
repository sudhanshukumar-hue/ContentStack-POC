import type { Metadata } from "next";
import { withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: "How this site uses Contentstack",
  description: "What Contentstack is, and how this Next.js homepage reads published content from it.",
};

export default function ContentstackGuide() {
  return (
    <article className="guide">
      <div className="container">
        <p className="eyebrow">Contentstack POC</p>
        <h1>What Contentstack is, and how this site uses it</h1>
        <p className="guide__lead">
          Contentstack is a headless CMS. Editors create and publish content there. This Next.js app
          does not store the page copy itself. It asks Contentstack for the published entries and
          renders them.
        </p>
        <p>
          <a href={withBase("/")}>Back to the homepage</a>
        </p>

        <h2>What Contentstack does</h2>
        <p>
          A headless CMS separates content from the website that displays it. In Contentstack, a
          content type is the shape of a piece of content, like a form. An entry is one filled-in
          piece of that form. Editors publish an entry to an environment, such as staging. The
          Content Delivery API then serves that published entry through a CDN, and any frontend can
          read it.
        </p>
        <ul>
          <li>
            <strong>Stack.</strong> The container for this project&apos;s content types, entries, and
            assets.
          </li>
          <li>
            <strong>Content type.</strong> The model. This site uses home page, header, footer, and
            testimonials.
          </li>
          <li>
            <strong>Entry.</strong> The actual content, for example the homepage sections or the main
            navigation.
          </li>
          <li>
            <strong>Environment.</strong> Where an entry is published. This app reads the staging
            environment.
          </li>
          <li>
            <strong>Delivery token.</strong> A read-only key that lets the app fetch published
            content. It cannot edit the stack.
          </li>
        </ul>

        <h2>How this app is connected</h2>
        <p>
          The app uses the Contentstack TypeScript Delivery SDK,{" "}
          <code>@contentstack/delivery-sdk</code>. On the server it creates one stack client with
          the API key, delivery token, environment name, and region. This stack lives in
          Contentstack&apos;s EU region, so the client is pointed at <code>eu</code> rather than the
          US CDN.
        </p>
        <p>Three reads build the page:</p>
        <ul>
          <li>
            <strong>Header.</strong> <code>contentType(&quot;header&quot;)</code> supplies the
            announcement, logo, navigation, dropdown items, and the trial button. The navbar stays
            fixed because the entry&apos;s sticky field is on.
          </li>
          <li>
            <strong>Homepage.</strong> <code>contentType(&quot;home_page&quot;)</code> returns one
            entry whose <code>sections</code> field is a modular block. Each block is a hero,
            feature grid, testimonials section, or closing banner.
          </li>
          <li>
            <strong>Footer.</strong> <code>contentType(&quot;footer&quot;)</code> supplies the
            tagline, link columns, newsletter text, social links, and legal links.
          </li>
        </ul>
        <p>
          Testimonials are not copied into the homepage entry. They are references to the
          testimonials content type. The homepage query calls{" "}
          <code>includeReference([&quot;sections.testimonials.reference&quot;])</code> so the quotes,
          names, and roles come back with the page instead of as empty ids.
        </p>

        <h2>How a block becomes a component</h2>
        <p>
          <code>BlockRenderer</code> walks <code>sections</code>. For each block it finds a key the
          app knows, then renders the matching React component and passes that block&apos;s fields
          as props.
        </p>
        <ul>
          <li>
            <code>hero</code> becomes the opening headline, text, image, and button.
          </li>
          <li>
            <code>feature_grid</code> becomes the three feature cards. An icon is an image group, so
            the component renders the file instead of printing the object.
          </li>
          <li>
            <code>testimonials</code> becomes the quote cards.
          </li>
          <li>
            <code>cta_banner</code> becomes the closing call to action.
          </li>
        </ul>
        <p>
          The header and footer are not blocks on the homepage. The root layout loads them on every
          page, including this one. Navigation links, button labels, and footer columns all come
          from published entries. Changing them in Contentstack and publishing to staging changes
          the site without a code edit.
        </p>

        <h2>What is published here</h2>
        <p>
          GitHub Pages serves the built HTML. The GitHub Action runs the Next.js build, fetches the
          current staging entries, and uploads the static site. The API key and delivery token stay
          in GitHub Actions secrets. They are not in this repository.
        </p>
      </div>
    </article>
  );
}

import { withBase } from "@/lib/paths";

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>This page is not published</h1>
        <p>The address is not a published Page entry in Contentstack yet.</p>
        <a className="btn btn--primary" href={withBase("/")}>
          Back home
        </a>
      </div>
    </section>
  );
}

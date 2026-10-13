"use client";

import { useState } from "react";

type Props = {
  heading?: string;
  description?: string;
  buttonLabel?: string;
};

export default function NewsletterForm({ heading, description, buttonLabel }: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="footer__newsletter">
      {heading && <h2>{heading}</h2>}
      {description && <p>{description}</p>}
      {submitted ? (
        <p className="footer__thanks">Thanks for subscribing.</p>
      ) : (
        <form
          className="footer__form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <label className="footer__label" htmlFor="footer-email">
            Email address
          </label>
          <input id="footer-email" type="email" name="email" required placeholder="Email address" />
          <button className="btn btn--primary" type="submit">
            {buttonLabel || "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}

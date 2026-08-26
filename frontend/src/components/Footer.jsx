import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-line mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="font-display font-bold text-lg mb-2">
            <span className="text-ink">Rent</span>
            <span className="text-brand">It</span>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            We all have things lying around that take up space — Rent It lets your neighbors borrow
            them, and lets you earn from what you don't use every day.
          </p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-brand hover:bg-brand-soft transition-colors"
                aria-label="Social link"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn
          title="Marketplace"
          links={[
            ["Browse listings", "/browse"],
            ["List an item", "/dashboard/listings/new"],
            ["How it works", "/#how-it-works"],
            ["Categories", "/browse"],
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            ["Help center", "/help"],
            ["Trust & safety", "/help#trust"],
            ["Report a problem", "/help#report"],
            ["Contact us", "/help#contact"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["About Rent It", "/about"],
            ["Terms of Service", "/legal/terms"],
            ["Privacy Policy", "/legal/privacy"],
            ["Prohibited items", "/legal/prohibited-items"],
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <p>© {new Date().getFullYear()} Rent It. All rights reserved.</p>
          <p>Made for communities across Nepal — rent anything, your way.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-sm text-muted hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

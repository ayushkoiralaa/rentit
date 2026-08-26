import React from "react";

function StaticPage({ title, children }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display font-bold text-2xl mb-5">{title}</h1>
      <div className="prose prose-sm text-ink/80 leading-relaxed space-y-4">{children}</div>
    </div>
  );
}

export function Help() {
  return (
    <StaticPage title="Help Center">
      <p>Need a hand? Here's how the essentials work.</p>
      <h3 id="trust" className="font-semibold text-ink pt-2">Trust & Safety</h3>
      <p>Every booking runs through server-calculated pricing and a security deposit set by the owner. Rate your counterpart after each rental — ratings help everyone make better decisions.</p>
      <h3 id="report" className="font-semibold text-ink pt-2">Report a problem</h3>
      <p>Use the flag icon on any listing to report scams, fake listings, or unsafe behavior. Our team reviews every report.</p>
      <h3 id="contact" className="font-semibold text-ink pt-2">Contact us</h3>
      <p>Reach us at support@rentit.demo for anything not covered here.</p>
    </StaticPage>
  );
}

export function About() {
  return (
    <StaticPage title="About Rent It">
      <p>
        We all have things lying around — a drill used twice a year, a camera between trips, a suit
        worn once. Rent It connects people who have what you need with people who need it, for as
        long as they need it.
      </p>
      <p>List what you're not using, rent what you need, and skip buying things you'll use once.</p>
    </StaticPage>
  );
}

export function Terms() {
  return (
    <StaticPage title="Terms of Service">
      <p>This is placeholder demo content. Replace with your actual terms before going live.</p>
      <p>By using Rent It, you agree to treat rented items with care, return them on the agreed date, and communicate honestly with other users.</p>
    </StaticPage>
  );
}

export function Privacy() {
  return (
    <StaticPage title="Privacy Policy">
      <p>This is placeholder demo content. Replace with your actual privacy policy before going live.</p>
      <p>We store your account details, listings, and booking history to operate the marketplace. We never sell your data.</p>
    </StaticPage>
  );
}

export function ProhibitedItems() {
  return (
    <StaticPage title="Prohibited Items">
      <p>The following may not be listed on Rent It: weapons and firearms, illegal drugs or paraphernalia, hazardous materials, counterfeit goods, and any item that requires a license the owner does not hold.</p>
    </StaticPage>
  );
}

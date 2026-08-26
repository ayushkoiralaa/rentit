import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center px-4 py-24">
      <h1 className="font-display font-extrabold text-5xl text-brand mb-3">404</h1>
      <p className="text-muted mb-6">This page doesn't exist or may have moved.</p>
      <Link to="/" className="text-brand font-semibold">Back to home</Link>
    </div>
  );
}

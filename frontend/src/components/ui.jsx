import React from "react";
import { Loader2, Inbox } from "lucide-react";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-brand ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={28} />
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-line rounded-2xl py-16 px-6 text-center">
      <Inbox size={32} className="mx-auto text-muted mb-3" />
      <h3 className="font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mx-auto mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border border-line font-semibold rounded-xl px-5 py-2.5 text-sm text-ink hover:border-brand hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border border-danger/30 text-danger font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextField({ label, error, className = "", ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-semibold text-muted mb-1.5">{label}</span>}
      <input
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-surface outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function TextArea({ label, error, className = "", ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-semibold text-muted mb-1.5">{label}</span>}
      <textarea
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-surface outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-y ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function SelectField({ label, error, children, className = "", ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-semibold text-muted mb-1.5">{label}</span>}
      <select
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-surface outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

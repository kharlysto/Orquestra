"use client";

/**
 * Compatibility component retained for the dashboard import.
 * React owns the select elements directly; imperatively moving them into
 * generated wrappers causes React's removeChild reconciliation error.
 */
export default function DropdownEnhancer() {
  return null;
}

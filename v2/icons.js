const paths = {
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z"/>',
  levels:
    '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  chair:
    '<path d="M7 3h10v9H7zM5 10v5h14v-5M12 15v5M7 21l5-2 5 2M8 6h8M8 9h8"/>',
  coffee:
    '<path d="M5 8h12v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM17 9h2a3 3 0 0 1 0 6h-2M8 2v3M12 1v4M16 2v3"/>',
  pen: '<path d="m5 18-1 3 3-1L20 7l-3-3zM14 7l3 3M5 18l2 2"/>',
  route:
    '<path d="M5 19c12 2 16-8 7-8S3 3 16 4M13 1l4 3-4 3"/><circle cx="5" cy="19" r="2"/>',
  paper: '<path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/>',
  heart:
    '<path d="M12 20S2 14 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 6-10 12-10 12Z"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  gear: '<path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  sound:
    '<path d="M3 9h4l5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>',
  muted: '<path d="M3 9h4l5-4v14l-5-4H3zM16 9l6 6M22 9l-6 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  trophy:
    '<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 14v5M7 21h10M9 19h6"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  shoe: '<path d="M8 3h7l1 8 4 3a3 3 0 0 1 1 3v3H3v-5l5-3zM3 17h18M9 8h5M9 11h6M8 3v7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  reset: '<path d="M4 8a9 9 0 1 1-1 7M4 3v6h6"/>',
  leaf: '<path d="M20 3C9 1 2 8 6 15s15 3 14-12ZM5 20 16 8"/>',
};
export function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.chair}</svg>`;
}

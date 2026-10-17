/** A static, fixed-text badge, so it contains nothing from the user's machine. */
export function renderBadge(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="20" role="img" aria-label="works on: my machine">
  <rect width="70" height="20" fill="#555"/>
  <rect x="70" width="120" height="20" fill="#9a7420"/>
  <g fill="#fff" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
    <text x="35" y="14">works on</text>
    <text x="130" y="14">my machine ⚖️</text>
  </g>
</svg>
`;
}

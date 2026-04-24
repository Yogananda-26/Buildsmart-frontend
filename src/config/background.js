// Prefer a local `public/landingpage.png` if present. In Create React App, PUBLIC_URL points to the public folder.
const local = `${process.env.PUBLIC_URL || ''}/landingpage.png`;
export const CONSTRUCTION_BG = local;

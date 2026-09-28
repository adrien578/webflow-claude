// La CLI Webflow (css-loader v7) expose les classes en exports nommés :
// on importe donc les modules CSS avec `import * as styles`.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export = classes;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.otf" {
  const src: string;
  export default src;
}
declare module "*.ttf" {
  const src: string;
  export default src;
}

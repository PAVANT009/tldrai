declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse = require("pdf-parse");
  export = pdfParse;
}

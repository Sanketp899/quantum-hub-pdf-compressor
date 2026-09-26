# Quantum Hub PDF Compressor

Browser-based PDF compression using WebAssembly.

## Features
- **Lossless PDF optimization** (via qpdf WASM)
- **Deep image compression** (via Ghostscript 10.08.0 WASM bicubic downsampling & DCT encoding)
- **Browser-side processing**: 100% client-side execution in WebAssembly Web Workers
- **Zero PDF upload**: Files never leave the user's device
- **Zero server-side PDF processing**: ₹0 server cost, runs on static hosts like Cloudflare Pages

## Technology
- React 19
- TypeScript
- Vite
- qpdf WebAssembly (`pdfstudio`)
- Ghostscript WebAssembly (`@wasm-zoo/ghostscript`)
- Tailwind CSS

## Privacy
PDF files are processed locally in the user's browser. The application does not upload PDFs to a PDF-processing server or external service.

## Licensing
This application is distributed under the **GNU Affero General Public License version 3 or later** (AGPL-3.0-or-later).

## Third-party software
- **Ghostscript 10.08.0**
  License: AGPL-3.0-or-later
- **qpdf**
  License: Apache-2.0 / Artistic License 2.0

See:
- `LICENSE`
- `LICENSE-Ghostscript.txt`
- `THIRD-PARTY-NOTICES.md`

## Source
This repository contains the complete source required to build the publicly deployed PDF compressor.

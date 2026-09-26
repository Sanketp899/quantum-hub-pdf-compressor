/// <reference types="vite/client" />

declare module 'pdfstudio' {
  export interface PdfToolkitOptions {
    wasmUrl?: string;
  }

  export interface PdfToolkitInstance {
    raw(inputs: Uint8Array[], args: string[]): Promise<Uint8Array>;
    [key: string]: any;
  }

  export function createPdfToolkit(options?: PdfToolkitOptions): Promise<PdfToolkitInstance>;
}

declare module 'pdfstudio/qpdf.wasm?url' {
  const url: string;
  export default url;
}

declare module '@wasm-zoo/ghostscript' {
  export interface ExecFile {
    name: string;
    data: ArrayBuffer | Uint8Array;
  }
  export interface ExecOptions {
    files?: ExecFile[];
    dirs?: string[];
    outputs?: string[];
  }
  export interface ExecResult {
    files?: ExecFile[];
    stdout?: string;
    stderr?: string;
    exitCode?: number;
  }
  export interface GhostscriptInstance {
    exec(args: string[], options?: ExecOptions): Promise<ExecResult>;
    dispose(): void;
  }
  export function load(): Promise<GhostscriptInstance>;
}

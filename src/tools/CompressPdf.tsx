import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileDown,
  FileText,
  Gauge,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

type CompressionMode =
  | 'lossless'
  | 'balanced'
  | 'maximum'
  | 'extreme';

type WorkerResponse =
  | {
      type: 'progress';
      requestId: number;
      progress: number;
      status: string;
    }
  | {
      type: 'complete';
      requestId: number;
      bytes: ArrayBuffer;
      engine: 'qpdf';
      quality: string;
    }
  | {
      type: 'error';
      requestId: number;
      message: string;
    };

type Candidate = {
  dpi: number;
  qFactor: number;

  /*
   * When false, existing JPEG/JPX images can pass through
   * when Ghostscript does not need to modify them.
   *
   * When true, existing JPEG/JPX images are deliberately
   * recompressed.
   */
  recompressExistingJpeg: boolean;

  label: string;
};

type GhostscriptOutputFile = {
  name: string;
  data: ArrayBuffer | Uint8Array;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const LARGE_FILE_WARNING = 50 * 1024 * 1024;

const MODES: Record<
  CompressionMode,
  {
    label: string;
    description: string;
    quality: string;
    speed: string;
  }
> = {
  lossless: {
    label: 'Lossless',
    description:
      'Structural optimization only. No intentional image quality loss.',
    quality: 'Original visual data',
    speed: 'Fast',
  },

  balanced: {
    label: 'Balanced',
    description:
      'High-quality compression designed to reduce size while protecting document readability.',
    quality: 'High',
    speed: 'Medium',
  },

  maximum: {
    label: 'Maximum',
    description:
      'Stronger image compression for substantially smaller files while retaining readable document quality.',
    quality: 'Medium-high',
    speed: 'Slower',
  },

  extreme: {
    label: 'Extreme',
    description:
      'Aggressive image compression for users who need the smallest practical PDF.',
    quality: 'Trade-off',
    speed: 'Slowest',
  },
};

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function isPdf(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    /\.pdf$/i.test(file.name)
  );
}

function safeName(name: string): string {
  const base = name
    .replace(/\.pdf$/i, '')
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      '_',
    )
    .trim();

  return (base || 'document').slice(0, 120);
}

function friendlyError(error: unknown): string {
  const text =
    error instanceof Error
      ? error.message.toLowerCase()
      : '';

  if (
    text.includes('password') ||
    text.includes('encrypted')
  ) {
    return 'This PDF is password-protected or encrypted. Unlock it first, then try again.';
  }

  if (
    text.includes('invalid') ||
    text.includes('xref') ||
    text.includes('parse') ||
    text.includes('damaged')
  ) {
    return 'The PDF appears to be damaged or invalid. Try saving a fresh copy from a PDF reader.';
  }

  if (
    text.includes('memory') ||
    text.includes('allocation') ||
    text.includes('out of memory') ||
    text.includes('cannot enlarge memory')
  ) {
    return 'The browser ran out of memory. Try a smaller PDF, close other browser tabs, or use Lossless mode.';
  }

  if (
    text.includes('rangecheck') ||
    text.includes('undefinedresult') ||
    text.includes('putdeviceprops')
  ) {
    return 'Ghostscript could not process this PDF with the selected compression settings. Try a less aggressive compression mode.';
  }

  if (
    text.includes('ghostscript') ||
    text.includes('wasm')
  ) {
    return (
      error instanceof Error && error.message
        ? error.message
        : 'The local Ghostscript compression engine failed.'
    );
  }

  return error instanceof Error &&
    error.message
    ? error.message
    : 'Compression failed. Please try again.';
}

/* -------------------------------------------------------
   GHOSTSCRIPT CANDIDATES
------------------------------------------------------- */

function candidatesForMode(
  mode: Exclude<
    CompressionMode,
    'lossless'
  >,
): Candidate[] {
  /*
   * IMPORTANT:
   *
   * qFactor is Ghostscript's native QFactor scale.
   *
   * Do NOT use:
   *
   * qFactor: 90
   * qFactor / 100
   *
   * Use values such as:
   *
   * 0.90
   * 0.76
   * 0.60
   * 0.50
   *
   * Ghostscript documents these values directly.
   */

  if (mode === 'balanced') {
    return [
      {
        dpi: 200,
        qFactor: 0.90,
        recompressExistingJpeg: false,
        label: '200 DPI • Maximum Visual Quality',
      },
      {
        dpi: 150,
        qFactor: 0.76,
        recompressExistingJpeg: false,
        label: '150 DPI • High Visual Quality',
      },
    ];
  }

  if (mode === 'maximum') {
    return [
      {
        dpi: 180,
        qFactor: 0.76,
        recompressExistingJpeg: true,
        label: '180 DPI • High Quality',
      },
      {
        dpi: 150,
        qFactor: 0.60,
        recompressExistingJpeg: true,
        label: '150 DPI • Strong Compression',
      },
      {
        dpi: 140,
        qFactor: 0.50,
        recompressExistingJpeg: true,
        label: '140 DPI • Smaller Size',
      },
      {
        dpi: 120,
        qFactor: 0.40,
        recompressExistingJpeg: true,
        label: '120 DPI • Stronger Compression',
      },
    ];
  }

  /*
   * Extreme
   *
   * Aggressive reduction while retaining a
   * reasonable reading target.
   */
  return [
    {
      dpi: 150,
      qFactor: 0.60,
      recompressExistingJpeg: true,
      label: '150 DPI • Good Quality',
    },
    {
      dpi: 140,
      qFactor: 0.50,
      recompressExistingJpeg: true,
      label: '140 DPI • Smaller Size',
    },
    {
      dpi: 120,
      qFactor: 0.40,
      recompressExistingJpeg: true,
      label: '120 DPI • Strong Compression',
    },
    {
      dpi: 100,
      qFactor: 0.30,
      recompressExistingJpeg: true,
      label: '100 DPI • Maximum Compression',
    },
  ];
}

/* -------------------------------------------------------
   GHOSTSCRIPT ARGUMENTS
------------------------------------------------------- */

function ghostscriptArgs(
  candidate: Candidate,
): string[] {
  /*
   * Clamp to Ghostscript's native QFactor range.
   *
   * IMPORTANT:
   * qFactor is already 0.0–1.0.
   *
   * There is NO /100 conversion here.
   */
  const qFactor = Math.max(
    0.1,
    Math.min(
      1,
      candidate.qFactor,
    ),
  );

  /*
   * Ghostscript's pdfwrite device expects the
   * image dictionaries through setdistillerparams.
   *
   * LockDistillerParams is important when processing
   * PDF input because setpagedevice may otherwise reset
   * distiller parameters for each page.
   */
  const imageParams = `
    <<
      /LockDistillerParams true

      /ColorImageDict
      <<
        /QFactor ${qFactor}
        /Blend 1
        /HSamples [2 1 1 2]
        /VSamples [2 1 1 2]
      >>

      /GrayImageDict
      <<
        /QFactor ${qFactor}
        /Blend 1
        /HSamples [2 1 1 2]
        /VSamples [2 1 1 2]
      >>
    >>
    setdistillerparams
  `;

  return [
    '-dSAFER',
    '-dBATCH',
    '-dNOPAUSE',
    '-dQUIET',

    /*
     * High-level PDF writer.
     */
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',

    /*
     * Output must be specified before -c.
     */
    '-sOutputFile=/output/compressed.pdf',

    /*
     * Do not automatically rotate pages.
     */
    '-dAutoRotatePages=/None',

    /*
     * Structural optimization.
     */
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
    '-dCompressPages=true',
    '-dCompressStreams=true',

    /*
     * Keep repeated images as shared XObjects
     * instead of embedding duplicate inline copies.
     */
    '-dMaxInlineImageSize=0',

    /*
     * Preserve useful PDF features where
     * Ghostscript supports preservation.
     */
    '-dPreserveAnnots=true',
    '-dPreserveMarkedContent=true',
    '-dWantsOptionalContent=true',

    /*
     * JPEG / JPX pass-through.
     *
     * Balanced:
     * preserve existing JPEGs unless Ghostscript
     * must modify them because of downsampling/etc.
     *
     * Maximum / Extreme:
     * deliberately recompress existing images.
     */
    `-dPassThroughJPEGImages=${
      candidate.recompressExistingJpeg
        ? 'false'
        : 'true'
    }`,

    `-dPassThroughJPXImages=${
      candidate.recompressExistingJpeg
        ? 'false'
        : 'true'
    }`,

    /*
     * -------------------------------
     * COLOR IMAGE DOWNSAMPLING
     * -------------------------------
     */
    '-dDownsampleColorImages=true',
    '-dColorImageDownsampleType=/Bicubic',
    `-dColorImageResolution=${candidate.dpi}`,
    '-dColorImageDownsampleThreshold=1.0',

    /*
     * -------------------------------
     * GRAYSCALE IMAGE DOWNSAMPLING
     * -------------------------------
     */
    '-dDownsampleGrayImages=true',
    '-dGrayImageDownsampleType=/Bicubic',
    `-dGrayImageResolution=${candidate.dpi}`,
    '-dGrayImageDownsampleThreshold=1.0',

    /*
     * -------------------------------
     * MONOCHROME IMAGE DOWNSAMPLING
     * -------------------------------
     *
     * Keep mono images at approximately 2x the
     * selected color/gray resolution.
     *
     * Ghostscript does not have a lossy JPEG
     * filter for 1-bit images, so don't try to
     * apply JPEG quality to them.
     */
    '-dDownsampleMonoImages=true',
    '-dMonoImageDownsampleType=/Subsample',
    `-dMonoImageResolution=${Math.max(
      150,
      Math.round(
        candidate.dpi * 2,
      ),
    )}`,
    '-dMonoImageDownsampleThreshold=1.0',

    /*
     * -------------------------------
     * COLOR / GRAY ENCODING
     * -------------------------------
     *
     * DCTEncode = JPEG compression.
     */
    '-dEncodeColorImages=true',
    '-dEncodeGrayImages=true',
    '-dEncodeMonoImages=true',

    '-dAutoFilterColorImages=false',
    '-dAutoFilterGrayImages=false',

    '-dColorImageFilter=/DCTEncode',
    '-dGrayImageFilter=/DCTEncode',

    /*
     * -------------------------------
     * IMAGE QUALITY
     * -------------------------------
     *
     * QFactor is configured through
     * ColorImageDict / GrayImageDict.
     *
     * IMPORTANT:
     * This must be before the input file.
     */
    '-c',
    imageParams,

    /*
     * -------------------------------
     * INPUT PDF
     * -------------------------------
     */
    '-f',
    '/input/input.pdf',
  ];
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export default function CompressPdf() {
  const [file, setFile] =
    useState<File | null>(null);

  const [mode, setMode] =
    useState<CompressionMode>(
      'balanced',
    );

  const [pageCount, setPageCount] =
    useState<number | null>(null);

  const [processing, setProcessing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [status, setStatus] =
    useState('');

  const [error, setError] =
    useState('');

  const [resultUrl, setResultUrl] =
    useState<string | null>(null);

  const [resultSize, setResultSize] =
    useState(0);

  const [quality, setQuality] =
    useState('');

  const [engine, setEngine] =
    useState<
      'qpdf' | 'ghostscript' | ''
    >('');

  const inputRef =
    useRef<HTMLInputElement>(null);

  const workerRef =
    useRef<Worker | null>(null);

  const resultUrlRef =
    useRef<string | null>(null);

  const requestIdRef =
    useRef(0);

  /* -----------------------------------------------------
     QPDF WORKER
  ----------------------------------------------------- */

  useEffect(() => {
    const worker = new Worker(
      new URL(
        './compressPdf.worker.ts',
        import.meta.url,
      ),
      {
        type: 'module',
      },
    );

    workerRef.current = worker;

    worker.onmessage = (
      event: MessageEvent<WorkerResponse>,
    ) => {
      const message = event.data;

      if (
        message.requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (
        message.type === 'progress'
      ) {
        setProgress(
          message.progress,
        );

        setStatus(
          message.status,
        );

        return;
      }

      if (
        message.type === 'error'
      ) {
        setError(
          friendlyError(
            new Error(
              message.message,
            ),
          ),
        );

        setProcessing(false);
        setProgress(0);
        setStatus('');

        return;
      }

      const blob = new Blob(
        [message.bytes],
        {
          type: 'application/pdf',
        },
      );

      if (
        resultUrlRef.current
      ) {
        URL.revokeObjectURL(
          resultUrlRef.current,
        );
      }

      const url =
        URL.createObjectURL(
          blob,
        );

      resultUrlRef.current = url;

      setResultUrl(url);
      setResultSize(blob.size);
      setQuality(message.quality);
      setEngine(message.engine);
      setProgress(100);
      setStatus(
        'Compression complete',
      );
      setProcessing(false);
    };

    worker.onerror = (
      event,
    ) => {
      console.error(
        'Compression worker error:',
        event,
      );

      setError(
        'The local qpdf compression engine failed to start. Refresh the page and try again.',
      );

      setProcessing(false);
      setProgress(0);
      setStatus('');
    };

    return () => {
      requestIdRef.current += 1;

      worker.terminate();

      workerRef.current = null;

      if (
        resultUrlRef.current
      ) {
        URL.revokeObjectURL(
          resultUrlRef.current,
        );
      }

      resultUrlRef.current = null;
    };
  }, []);

  /* -----------------------------------------------------
     RESULT CLEANUP
  ----------------------------------------------------- */

  const clearResult = () => {
    if (
      resultUrlRef.current
    ) {
      URL.revokeObjectURL(
        resultUrlRef.current,
      );
    }

    resultUrlRef.current = null;

    setResultUrl(null);
    setResultSize(0);
    setQuality('');
    setEngine('');
  };

  /* -----------------------------------------------------
     PDF INSPECTION
  ----------------------------------------------------- */

  const inspect = async (
    selected: File,
  ) => {
    try {
      const {
        PDFDocument,
      } = await import(
        'pdf-lib'
      );

      const bytes =
        await selected.arrayBuffer();

      const pdf =
        await PDFDocument.load(
          bytes,
          {
            ignoreEncryption: true,
            updateMetadata: false,
          },
        );

      setPageCount(
        pdf.getPageCount(),
      );
    } catch {
      setPageCount(null);
    }
  };

  /* -----------------------------------------------------
     FILE SELECTION
  ----------------------------------------------------- */

  const handleFile = (
    selected: File | null,
  ) => {
    if (!selected) {
      return;
    }

    if (!isPdf(selected)) {
      setError(
        'Please select a PDF file.',
      );

      return;
    }

    if (selected.size === 0) {
      setError(
        'The selected PDF is empty.',
      );

      return;
    }

    if (
      selected.size >
      MAX_FILE_SIZE
    ) {
      setError(
        `This file is ${formatBytes(
          selected.size,
        )}. The browser limit is ${formatBytes(
          MAX_FILE_SIZE,
        )}.`,
      );

      return;
    }

    requestIdRef.current += 1;

    setFile(selected);
    setPageCount(null);
    setError('');
    setStatus('');
    setProgress(0);

    clearResult();

    /*
     * Avoid parsing very large PDFs merely to
     * determine page count.
     */
    if (
      selected.size <=
      LARGE_FILE_WARNING
    ) {
      void inspect(selected);
    }
  };

  /* -----------------------------------------------------
     RESET
  ----------------------------------------------------- */

  const reset = () => {
    requestIdRef.current += 1;

    setFile(null);
    setPageCount(null);
    setError('');
    setStatus('');
    setProgress(0);
    setProcessing(false);

    clearResult();

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  /* -----------------------------------------------------
     GHOSTSCRIPT COMPRESSION
  ----------------------------------------------------- */

  const compressWithGhostscript =
    async (
      input: Uint8Array,
      requestId: number,
      selectedMode: Exclude<
        CompressionMode,
        'lossless'
      >,
    ) => {
      /*
       * @wasm-zoo/ghostscript creates and manages
       * its own execution Worker.
       *
       * Therefore Ghostscript is loaded directly here,
       * not inside the qpdf Worker.
       */

      setProgress(5);

      setStatus(
        'Loading Ghostscript WASM engine...',
      );

      const {
        load,
      } = await import(
        '@wasm-zoo/ghostscript'
      );

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      const gs =
        await load();

      try {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setProgress(10);

        setStatus(
          'Ghostscript WASM engine loaded.',
        );

        const candidates =
          candidatesForMode(
            selectedMode,
          );

        let best: Uint8Array =
          input;

        let bestCandidate:
          Candidate | null =
          null;

        for (
          let index = 0;
          index <
          candidates.length;
          index += 1
        ) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const candidate =
            candidates[index];

          /*
           * Candidate progress:
           *
           * 15% start
           * up to ~90% during candidates
           */
          const startProgress = 15;

          const availableProgress = 75;

          const candidateProgress =
            startProgress +
            Math.round(
              (index /
                candidates.length) *
                availableProgress,
            );

          setProgress(
            candidateProgress,
          );

          setStatus(
            `Ghostscript: compressing ${candidate.label}...`,
          );

          const result =
            await gs.exec(
              ghostscriptArgs(
                candidate,
              ),
              {
                files: [
                  {
                    name:
                      '/input/input.pdf',
                    data: input,
                  },
                ],

                dirs: [
                  '/input',
                  '/output',
                ],

                outputs: [
                  '/output/compressed.pdf',
                ],
              },
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const found =
            (
              result.files ??
              []
            ).find(
              (
                item: GhostscriptOutputFile,
              ) =>
                item.name ===
                '/output/compressed.pdf',
            );

          if (
            !found ||
            !found.data ||
            found.data.byteLength === 0
          ) {
            throw new Error(
              'Ghostscript produced an empty PDF.',
            );
          }

          const candidateBytes =
            new Uint8Array(
              found.data,
            );

          setProgress(
            Math.min(
              90,
              candidateProgress +
                Math.max(
                  1,
                  Math.round(
                    70 /
                      candidates.length,
                  ),
                ),
            ),
          );

          setStatus(
            `Evaluating ${candidate.label} result...`,
          );

          /*
           * IMPORTANT:
           *
           * Never replace the original with a
           * larger result.
           */
          if (
            candidateBytes.byteLength <
            best.byteLength
          ) {
            best =
              candidateBytes;

            bestCandidate =
              candidate;
          }

          console.log(
            `[${selectedMode}] Candidate: ${candidate.label} → ${candidateBytes.byteLength} bytes`,
          );

          console.log(
            `[${selectedMode}] Current best: ${
              bestCandidate?.label ??
              'original'
            } → ${best.byteLength} bytes`,
          );

          /*
           * Yield to the browser between candidates.
           */
          await new Promise<void>(
            (resolve) => {
              setTimeout(
                resolve,
                0,
              );
            },
          );
        }

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setProgress(94);

        setStatus(
          'Selecting the smallest valid result...',
        );

        /*
         * If Ghostscript did not make the file smaller,
         * retain the original.
         */
        const finalBytes =
          bestCandidate
            ? best
            : input;

        const finalQuality =
          bestCandidate
            ? bestCandidate.label
            : 'No smaller Ghostscript candidate; original retained';

        const output =
          new ArrayBuffer(
            finalBytes.byteLength,
          );

        new Uint8Array(
          output,
        ).set(finalBytes);

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        const blob =
          new Blob(
            [output],
            {
              type: 'application/pdf',
            },
          );

        if (
          resultUrlRef.current
        ) {
          URL.revokeObjectURL(
            resultUrlRef.current,
          );
        }

        const url =
          URL.createObjectURL(
            blob,
          );

        resultUrlRef.current =
          url;

        setResultUrl(url);
        setResultSize(
          blob.size,
        );

        setQuality(
          finalQuality,
        );

        setEngine(
          'ghostscript',
        );

        setProgress(100);

        setStatus(
          'Compression complete',
        );

        setProcessing(false);
      } finally {
        try {
          gs.dispose();
        } catch (disposeError) {
          console.warn(
            'Ghostscript dispose failed:',
            disposeError,
          );
        }
      }
    };

  /* -----------------------------------------------------
     MAIN COMPRESS FUNCTION
  ----------------------------------------------------- */

  const compress = async () => {
    if (!file) {
      return;
    }

    if (
      mode === 'lossless' &&
      !workerRef.current
    ) {
      setError(
        'The local qpdf worker is not ready. Refresh the page and try again.',
      );

      return;
    }

    requestIdRef.current += 1;

    const requestId =
      requestIdRef.current;

    setError('');
    clearResult();
    setProcessing(true);

    setProgress(3);

    setStatus(
      'Reading PDF into memory...',
    );

    try {
      const bytes =
        await file.arrayBuffer();

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (!bytes.byteLength) {
        throw new Error(
          'The PDF is empty.',
        );
      }

      const input =
        new Uint8Array(bytes);

      /* --------------------------------------------------
         LOSSLESS → QPDF WORKER
      -------------------------------------------------- */

      if (
        mode === 'lossless'
      ) {
        setProgress(5);

        setStatus(
          'Starting local qpdf compression engine...',
        );

        workerRef.current?.postMessage(
          {
            type: 'compress',
            requestId,
            bytes,
            mode: 'lossless',
          },
          [bytes],
        );

        return;
      }

      /* --------------------------------------------------
         DEEP COMPRESSION → GHOSTSCRIPT
      -------------------------------------------------- */

      setProgress(4);

      setStatus(
        'Starting local Ghostscript compression...',
      );

      await compressWithGhostscript(
        input,
        requestId,
        mode,
      );
    } catch (
      compressionError
    ) {
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      console.error(
        'PDF compression error:',
        compressionError,
      );

      setError(
        friendlyError(
          compressionError,
        ),
      );

      setProcessing(false);
      setProgress(0);
      setStatus('');
    }
  };

  /* -----------------------------------------------------
     DOWNLOAD
  ----------------------------------------------------- */

  const download = () => {
    if (
      !resultUrl ||
      !file
    ) {
      return;
    }

    const anchor =
      document.createElement(
        'a',
      );

    anchor.href =
      resultUrl;

    anchor.download =
      `${safeName(
        file.name,
      )}-compressed.pdf`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();
  };

  /* -----------------------------------------------------
     RESULT INFO
  ----------------------------------------------------- */

  const saved =
    file && resultSize
      ? file.size -
        resultSize
      : 0;

  const reduction =
    file && resultSize
      ? ((file.size -
          resultSize) /
          file.size) *
        100
      : 0;

  const larger =
    saved < 0;

  const engineLabel =
    engine ===
    'ghostscript'
      ? 'Ghostscript WASM'
      : engine === 'qpdf'
        ? 'qpdf WASM'
        : '';

  /* -----------------------------------------------------
     UI
  ----------------------------------------------------- */

  return (
    <ToolLayout
      title="Compress PDF"
      description="Advanced client-side PDF optimization with lossless and deep compression modes."
      icon={
        <FileDown className="w-6 h-6" />
      }
    >
      <div className="space-y-6">
        {!file ? (
          <div
            onClick={() =>
              inputRef.current?.click()
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) => {
              event.preventDefault();

              handleFile(
                event.dataTransfer.files[0] ??
                  null,
              );
            }}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-10 sm:p-14 text-center cursor-pointer bg-slate-950/40 hover:bg-indigo-950/10 transition-all group shadow-inner"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-slate-700/60 shadow-lg">
              <Upload className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>

            <p className="text-slate-100 font-bold text-lg">
              Click or drag a PDF here
            </p>

            <p className="text-sm text-slate-400 mt-2">
              Up to{' '}
              {formatBytes(
                MAX_FILE_SIZE,
              )}{' '}
              • processed 100% locally in browser
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) =>
                handleFile(
                  event.target.files?.[0] ??
                    null,
                )
              }
            />
          </div>
        ) : (
          <>
            {/* FILE */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-100 truncate">
                  {file.name}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                  <span>
                    {formatBytes(
                      file.size,
                    )}
                  </span>

                  {pageCount !== null && (
                    <span>
                      • {pageCount} pages
                    </span>
                  )}

                  {file.size >
                    LARGE_FILE_WARNING && (
                    <span className="text-amber-400 font-medium">
                      • Large document
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                disabled={processing}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors border border-slate-800"
              >
                Change
              </button>
            </div>

            {/* MODES */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-5 h-5 text-indigo-400" />

                <h2 className="font-bold text-slate-100 text-sm sm:text-base">
                  Select Compression Mode
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  Object.keys(
                    MODES,
                  ) as CompressionMode[]
                ).map(
                  (
                    candidate,
                  ) => {
                    const info =
                      MODES[
                        candidate
                      ];

                    const selected =
                      mode ===
                      candidate;

                    return (
                      <button
                        key={
                          candidate
                        }
                        type="button"
                        disabled={
                          processing
                        }
                        onClick={() =>
                          setMode(
                            candidate,
                          )
                        }
                        className={`text-left rounded-2xl border p-4 transition-all ${
                          selected
                            ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        } disabled:opacity-60 cursor-pointer`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-slate-100 text-sm sm:text-base">
                            {
                              info.label
                            }
                          </span>

                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                          {
                            info.description
                          }
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold">
                          <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-slate-300">
                            Quality:{' '}
                            {
                              info.quality
                            }
                          </span>

                          <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-slate-300">
                            Speed:{' '}
                            {
                              info.speed
                            }
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            {/* ENGINE */}
            <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />

              <div className="text-xs sm:text-sm">
                <p className="font-bold text-slate-100">
                  Local Dual-Engine WebAssembly
                </p>

                <p className="text-slate-400 mt-1 leading-relaxed">
                  Lossless mode uses
                  qpdf WebAssembly.
                  Balanced, Maximum,
                  and Extreme use
                  Ghostscript WebAssembly
                  for image downsampling
                  and JPEG compression.
                  Processing runs
                  entirely on your device.
                </p>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                <p className="text-sm leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* PROGRESS */}
            {processing && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />

                  <p className="font-semibold text-slate-200 text-sm">
                    {status ||
                      'Processing...'}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Engine active</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {/* RESULT */}
            {resultUrl &&
              !processing && (
                <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />

                    <div className="flex-1">
                      <p className="font-bold text-slate-100 text-base">
                        {larger
                          ? 'Optimization completed, but this candidate is larger.'
                          : 'Optimization complete! Your PDF is ready.'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <p className="text-[11px] text-slate-400">
                            Original Size
                          </p>

                          <p className="font-bold text-slate-100 text-sm mt-0.5">
                            {formatBytes(
                              file.size,
                            )}
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <p className="text-[11px] text-slate-400">
                            Result Size
                          </p>

                          <p className="font-bold text-slate-100 text-sm mt-0.5">
                            {formatBytes(
                              resultSize,
                            )}
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <p className="text-[11px] text-slate-400">
                            {larger
                              ? 'Added'
                              : 'Saved'}
                          </p>

                          <p className="font-bold text-emerald-400 text-sm mt-0.5">
                            {formatBytes(
                              Math.abs(
                                saved,
                              ),
                            )}
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <p className="text-[11px] text-slate-400">
                            Net Reduction
                          </p>

                          <p className="font-bold text-emerald-400 text-sm mt-0.5">
                            {larger
                              ? `+${Math.abs(
                                  reduction,
                                ).toFixed(
                                  1,
                                )}%`
                              : `${Math.max(
                                  0,
                                  reduction,
                                ).toFixed(
                                  1,
                                )}% smaller`}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-4">
                        Engine:{' '}
                        <span className="text-slate-200 font-medium">{engineLabel}</span> •{' '}
                        {quality}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mt-5">
                        <button
                          type="button"
                          onClick={
                            download
                          }
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download Compressed PDF
                        </button>

                        <button
                          type="button"
                          onClick={
                            compress
                          }
                          disabled={
                            processing
                          }
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer text-sm"
                        >
                          <Zap className="w-4 h-4" />
                          Recompress
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* COMPRESS BUTTON */}
            {!processing && (
              <button
                type="button"
                onClick={compress}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <FileDown className="w-5 h-5" />

                {mode ===
                'lossless'
                  ? 'Optimize PDF (Lossless)'
                  : `Compress in ${MODES[mode].label} Mode`}
              </button>
            )}

            {/* PRIVACY */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />

              <div>
                <p className="font-bold text-slate-100 text-sm">
                  100% Client-Side Privacy Guarantee
                </p>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your PDF is kept in
                  your local browser memory.
                  The compression engines
                  run locally using
                  WebAssembly. No file
                  is ever uploaded to
                  our servers.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-slate-300 text-sm">
                Frequently Asked Questions
              </h3>

              <details className="group border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none font-semibold text-slate-200 text-sm">
                  Which mode should I choose?

                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                  Use <strong>Lossless</strong> when
                  preserving exact original
                  visual pixels is paramount (contracts,
                  vector graphics, architectural plans).
                  <strong> Balanced</strong> is recommended
                  for high-quality everyday compression.
                  <strong> Maximum</strong> and <strong>Extreme</strong> perform
                  stronger image reduction and DCT downsampling for the smallest file sizes.
                </div>
              </details>

              <details className="group border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none font-semibold text-slate-200 text-sm">
                  Can every PDF become significantly smaller?

                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                  No. A PDF that was already
                  heavily optimized or only contains
                  clean vector text has very little
                  redundancy to strip. The tool reports
                  the true honest byte reduction and will
                  never overwrite your file with a larger one.
                </div>
              </details>

              <details className="group border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none font-semibold text-slate-200 text-sm">
                  Will text remain selectable and searchable?

                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                  Yes! For standard PDFs that
                  contain native fonts and text streams,
                  Ghostscript's <code>pdfwrite</code> device preserves
                  fonts, subsets, and character glyph streams. It does
                  not rasterize the entire document into an image.
                </div>
              </details>

              <details className="group border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none font-semibold text-slate-200 text-sm">
                  Does this require any server infrastructure cost?

                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                  No. With ₹0 budget, the entire application
                  and WebAssembly bundles are served as static files
                  via Cloudflare Pages. All compute runs on the user's
                  device CPU using browser WebAssembly.
                </div>
              </details>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

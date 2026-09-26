import { createPdfToolkit } from 'pdfstudio';
import qpdfWasmUrl from 'pdfstudio/qpdf.wasm?url';

type CompressionMode =
  'lossless';

type WorkerRequest = {
  type: 'compress';
  requestId: number;
  bytes: ArrayBuffer;
  mode: CompressionMode;
};

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

type WorkerScope = {
  onmessage:
    | ((
        event: MessageEvent<WorkerRequest>,
      ) => void)
    | null;

  postMessage: (
    message: WorkerResponse,
    transfer?: Transferable[],
  ) => void;
};

const scope =
  self as unknown as WorkerScope;

/* -------------------------------------------------------
   QPDF TOOLKIT
------------------------------------------------------- */

let qpdfToolkitPromise:
  ReturnType<
    typeof createPdfToolkit
  > | null = null;

function getQpdfToolkit() {
  if (
    !qpdfToolkitPromise
  ) {
    qpdfToolkitPromise =
      createPdfToolkit({
        wasmUrl:
          qpdfWasmUrl,
      });
  }

  return qpdfToolkitPromise;
}

/* -------------------------------------------------------
   PROGRESS
------------------------------------------------------- */

function progress(
  requestId: number,
  value: number,
  status: string,
) {
  scope.postMessage({
    type: 'progress',
    requestId,
    progress:
      Math.max(
        0,
        Math.min(
          99,
          value,
        ),
      ),
    status,
  });
}

/* -------------------------------------------------------
   QPDF ARGUMENTS
------------------------------------------------------- */

function qpdfArgs(): string[] {
  return [
    /*
     * Recompress streams using zlib/Flate
     * without intentionally reducing image quality.
     */
    '--compress-streams=y',
    '--decode-level=generalized',
    '--recompress-flate',
    '--compression-level=9',

    /*
     * Generate object streams where supported.
     */
    '--object-streams=generate',

    /*
     * qpdf input / output placeholders.
     */
    '$in0',
    '$out',
  ];
}

/* -------------------------------------------------------
   LOSSLESS COMPRESSION
------------------------------------------------------- */

async function runLossless(
  input: Uint8Array,
  requestId: number,
): Promise<ArrayBuffer> {
  progress(
    requestId,
    8,
    'Loading qpdf WASM...',
  );

  const pdf =
    await getQpdfToolkit();

  progress(
    requestId,
    20,
    'qpdf WASM ready. Optimizing PDF structure...',
  );

  const output =
    await pdf.raw(
      [input],
      qpdfArgs(),
    );

  if (
    !output ||
    !output.byteLength
  ) {
    throw new Error(
      'qpdf produced an empty PDF.',
    );
  }

  progress(
    requestId,
    92,
    'Finalizing lossless optimization...',
  );

  /*
   * Create a standalone ArrayBuffer so that
   * transferring the result does not depend on
   * the original qpdf typed-array backing buffer.
   */
  const result =
    new ArrayBuffer(
      output.byteLength,
    );

  new Uint8Array(
    result,
  ).set(output);

  return result;
}

/* -------------------------------------------------------
   MESSAGE HANDLER
------------------------------------------------------- */

scope.onmessage =
  async (
    event: MessageEvent<WorkerRequest>,
  ) => {
    const request =
      event.data;

    if (
      !request ||
      request.type !==
        'compress'
    ) {
      return;
    }

    try {
      const input =
        new Uint8Array(
          request.bytes,
        );

      if (
        !input.byteLength
      ) {
        throw new Error(
          'The PDF is empty.',
        );
      }

      if (
        request.mode !==
        'lossless'
      ) {
        throw new Error(
          'The qpdf worker only handles Lossless mode.',
        );
      }

      const output =
        await runLossless(
          input,
          request.requestId,
        );

      progress(
        request.requestId,
        97,
        'Preparing download...',
      );

      scope.postMessage(
        {
          type: 'complete',
          requestId:
            request.requestId,
          bytes: output,
          engine: 'qpdf',
          quality:
            'Lossless structural optimization',
        },
        [output],
      );
    } catch (error) {
      scope.postMessage({
        type: 'error',
        requestId:
          request.requestId,
        message:
          error instanceof Error
            ? error.message
            : 'Local qpdf compression failed.',
      });
    }
  };

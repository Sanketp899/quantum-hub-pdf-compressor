import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Code2,
  Cpu,
  ExternalLink,
  FileCheck,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

type ToolLayoutProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

type ModalType =
  | 'privacy'
  | 'terms'
  | 'licenses'
  | 'source'
  | 'how-it-works'
  | null;

type WindowWithAdSense = Window & {
  adsbygoogle?: unknown[];
};

const GITHUB_URL =
  'https://github.com/Sanketp899/quantum-hub-pdf-compressor';

const MAIN_SITE_URL =
  'https://quantumtools.site/';

function AdBanner({
  slotId,
}: {
  slotId: string;
}) {
  useEffect(() => {
    try {
      const adWindow =
        window as WindowWithAdSense;

      adWindow.adsbygoogle =
        adWindow.adsbygoogle || [];

      adWindow.adsbygoogle.push({});
    } catch (error) {
      console.warn(
        'AdSense initialization failed:',
        error,
      );
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        width: '100%',
      }}
      data-ad-client="ca-pub-4241396850652533"
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export default function ToolLayout({
  title,
  description,
  icon,
  children,
}: ToolLayoutProps) {
  const [activeModal, setActiveModal] =
    useState<ModalType>(null);

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* TOP PRIVACY BAR */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Local browser processing
              </span>

              <span className="text-slate-700">
                •
              </span>

              <span>
                PDF contents are processed locally
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={MAIN_SITE_URL}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                Quantum Hub
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <Code2 className="w-3 h-3" />
                Source
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                {icon}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Quantum Hub
                    <span className="text-indigo-400">
                      {' '}
                      PDF Compressor
                    </span>
                  </h1>

                  <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                    AGPL-3.0
                  </span>
                </div>

                <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                  Browser-based PDF compression with WebAssembly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveModal(
                    'how-it-works',
                  )
                }
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5" />
                How It Works
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal('privacy')
                }
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Privacy
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal('licenses')
                }
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                Licenses
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* TOP AD */}
        <section
          aria-label="Advertisement"
          className="w-full"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Advertisement
              </span>

              <Sparkles className="w-3 h-3 text-slate-700" />
            </div>

            <div className="min-h-[90px] w-full flex items-center justify-center overflow-hidden">
              <AdBanner
                slotId="3573966771"
              />
            </div>
          </div>
        </section>

        {/* TITLE */}
        <section className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-400">
            {description}
          </p>
        </section>

        {/* TOOL */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8 shadow-2xl">
          {children}
        </section>

        {/* BOTTOM AD */}
        <section
          aria-label="Advertisement"
          className="w-full pt-2"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Advertisement
              </span>

              <Sparkles className="w-3 h-3 text-slate-700" />
            </div>

            <div className="min-h-[120px] w-full flex items-center justify-center overflow-hidden">
              <AdBanner
                slotId="8669993746"
              />
            </div>
          </div>
        </section>

        {/* INFORMATION */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Browser-based PDF compression
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Quantum Hub PDF Compressor uses
                WebAssembly engines in the browser.
                Supported PDF contents are processed
                locally rather than being sent to a
                PDF-processing server.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-slate-200">
                Lossless
              </h4>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Uses qpdf WebAssembly for structural
                PDF optimization without intentional
                image-quality reduction.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-slate-200">
                Deep compression
              </h4>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Uses Ghostscript WebAssembly to
                downsample and recompress suitable
                raster images.
              </p>
            </div>
          </div>
        </section>

        {/* PRIVACY NOTICE */}
        <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />

            <div>
              <h3 className="font-bold text-emerald-200">
                Local processing
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-emerald-100/70">
                PDF contents are processed in your
                browser. The compressor does not
                require a PDF-processing upload server.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-sm text-slate-200">
                Quantum Hub PDF Compressor
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Browser-based PDF compression utility.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={() =>
                  setActiveModal('privacy')
                }
                className="text-slate-400 hover:text-white transition-colors"
              >
                Privacy
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal('terms')
                }
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal('licenses')
                }
                className="text-slate-400 hover:text-white transition-colors"
              >
                Licenses
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal('source')
                }
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                Source Code
              </button>

              <a
                href={MAIN_SITE_URL}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                Quantum Hub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-6 pt-5 text-center">
            <p className="text-[11px] text-slate-600">
              Quantum Hub PDF Compressor is
              distributed under the GNU Affero
              General Public License version 3
              or later.
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {activeModal !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2.5">
                {activeModal ===
                  'privacy' && (
                  <Lock className="w-5 h-5 text-emerald-400" />
                )}

                {activeModal ===
                  'terms' && (
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                )}

                {activeModal ===
                  'licenses' && (
                  <Scale className="w-5 h-5 text-amber-400" />
                )}

                {activeModal ===
                  'source' && (
                  <Code2 className="w-5 h-5 text-indigo-400" />
                )}

                {activeModal ===
                  'how-it-works' && (
                  <Cpu className="w-5 h-5 text-indigo-400" />
                )}

                <h3 className="font-bold text-lg text-white">
                  {activeModal ===
                    'privacy' &&
                    'Privacy Policy'}

                  {activeModal ===
                    'terms' &&
                    'Terms of Service'}

                  {activeModal ===
                    'licenses' &&
                    'Licenses & Third-Party Notices'}

                  {activeModal ===
                    'source' &&
                    'Open Source & Source Code'}

                  {activeModal ===
                    'how-it-works' &&
                    'How Browser Compression Works'}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 text-sm leading-relaxed text-slate-400">
              {activeModal ===
                'privacy' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-emerald-200">
                    PDF contents are processed
                    locally in the browser.
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Document processing
                    </h4>

                    <p>
                      The compressor performs PDF
                      processing in the user's
                      browser using WebAssembly.
                      The application does not
                      require uploading PDF contents
                      to a PDF-processing server.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Advertising
                    </h4>

                    <p>
                      The website may display
                      advertising provided by Google
                      AdSense. Advertising services
                      may use cookies or similar
                      technologies according to
                      Google's applicable policies.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Browser resources
                    </h4>

                    <p>
                      JavaScript, WebAssembly,
                      stylesheets, fonts, images, and
                      advertising resources may be
                      downloaded by the browser in
                      order to operate the website.
                    </p>
                  </div>
                </div>
              )}

              {activeModal ===
                'terms' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Use of the service
                    </h4>

                    <p>
                      Quantum Hub PDF Compressor is
                      provided as a free browser-based
                      utility. Users are responsible
                      for maintaining backups of
                      important original documents.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      File integrity
                    </h4>

                    <p>
                      Compression can change image
                      data, PDF structure, metadata,
                      or other document properties.
                      Verify important output files
                      before relying on them.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Warranty disclaimer
                    </h4>

                    <p>
                      The software is provided on an
                      "as is" basis to the extent
                      permitted by the applicable
                      license and law.
                    </p>
                  </div>
                </div>
              )}

              {activeModal ===
                'licenses' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Quantum Hub PDF Compressor
                    </h4>

                    <p>
                      This application is released
                      under the GNU Affero General
                      Public License version 3 or
                      later.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Ghostscript 10.08.0
                    </h4>

                    <p>
                      Ghostscript is distributed under
                      the GNU Affero General Public
                      License version 3 or later.
                      See the repository's Ghostscript
                      license and third-party notices
                      for the applicable copyright and
                      license information.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      qpdf / pdfstudio
                    </h4>

                    <p>
                      The project uses qpdf-related
                      WebAssembly components through
                      the project's declared npm
                      dependencies. Refer to the
                      repository and dependency
                      license files for their
                      applicable licenses.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Third-party notices
                    </h4>

                    <p>
                      Complete applicable license
                      notices are provided in the
                      public GitHub repository.
                    </p>
                  </div>
                </div>
              )}

              {activeModal ===
                'source' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/30 p-4">
                    <p className="font-semibold text-indigo-200">
                      Public source repository
                    </p>

                    <p className="mt-2 break-all font-mono text-xs text-slate-400">
                      {GITHUB_URL}
                    </p>
                  </div>

                  <p>
                    The source code for this public
                    compressor application is available
                    from the GitHub repository below.
                  </p>

                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                    Open GitHub Repository
                  </a>

                  <p className="text-xs text-slate-500">
                    This compressor is deployed as a
                    separate application from the
                    private Quantum Hub website.
                  </p>
                </div>
              )}

              {activeModal ===
                'how-it-works' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Lossless mode
                    </h4>

                    <p>
                      Lossless mode uses qpdf
                      WebAssembly to optimize PDF
                      structure and recompress
                      supported streams without
                      intentionally reducing image
                      quality.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Deep compression modes
                    </h4>

                    <p>
                      Balanced, Maximum, and Extreme
                      use Ghostscript's pdfwrite
                      device to rewrite the PDF while
                      downsampling and recompressing
                      suitable raster images.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">
                      Candidate selection
                    </h4>

                    <p>
                      Deep compression can test
                      several compression settings and
                      keep the smallest successful
                      result produced by the selected
                      mode.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
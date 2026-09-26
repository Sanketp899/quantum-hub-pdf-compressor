import React, { useState } from 'react';
import {
  ShieldCheck,
  Code2,
  FileText,
  ExternalLink,
  Scale,
  Lock,
  Cpu,
  Info,
  X,
  HelpCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

type LegalModalType = 'privacy' | 'terms' | 'licenses' | 'source' | 'how-it-works' | null;

export default function ToolLayout({
  title,
  description,
  icon,
  children,
}: ToolLayoutProps) {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const [showAdNotice, setShowAdNotice] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner / Privacy Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side
            </span>
            <span className="text-slate-600">•</span>
            <span>PDFs never leave your browser</span>
            <span className="text-slate-600">•</span>
            <span>Zero server upload</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://quantumtools.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium text-slate-300"
            >
              Quantum Hub Main Site
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com/Sanketp899/quantum-hub-pdf-compressor"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <Code2 className="w-3 h-3" />
              GitHub AGPL-3.0
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Quantum Hub <span className="text-indigo-400">PDF Compressor</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  AGPL-3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Free high-efficiency PDF compressor powered by Ghostscript & qpdf WASM
              </p>
            </div>
          </div>

          {/* Header Quick Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveModal('how-it-works')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              How It Works
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Privacy
            </button>
            <button
              onClick={() => setActiveModal('licenses')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Licenses
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        
        {/* AdSense Zone 1: Top Responsive Banner */}
        <section aria-label="Advertisement" className="w-full">
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-3 text-center">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold tracking-wider uppercase mb-1 px-1">
              <span>Advertisement</span>
              <span className="text-[10px] text-slate-600 font-normal">AdSense Compliant Placement</span>
            </div>
            {/* Standard responsive ad container slot */}
            <div className="min-h-[90px] w-full flex flex-col items-center justify-center rounded-lg bg-slate-950/60 border border-slate-800/60 p-4 text-slate-400">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Google AdSense Display Space</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                Placed respectfully in compliance with Google publisher policies (not placed beside download triggers).
              </p>
            </div>
          </div>
        </section>

        {/* Tool Header Details */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* The Compression Tool Component */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-sm">
          {children}
        </div>

        {/* AdSense Zone 2: Bottom Banner (Spaced safely away from download action) */}
        <section aria-label="Advertisement" className="w-full pt-4">
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-3 text-center">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold tracking-wider uppercase mb-1 px-1">
              <span>Advertisement</span>
              <span className="text-[10px] text-slate-600 font-normal">Google AdSense Space</span>
            </div>
            <div className="min-h-[120px] w-full flex flex-col items-center justify-center rounded-lg bg-slate-950/60 border border-slate-800/60 p-4 text-slate-400">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Responsive Ad Unit</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports standard display formats (728x90, 336x280, 300x250, fluid responsive)
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture & Explainer Section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">
                Engine Architecture & Technology
              </h3>
              <p className="text-xs text-slate-400">
                True client-side WebAssembly execution with dual-engine pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Lossless Mode: qpdf WASM
              </div>
              <p className="text-slate-400 leading-relaxed">
                Utilizes Jay Berkenbilt's industry-standard <strong className="text-slate-300">qpdf</strong> compiled to WebAssembly. Recompresses object streams with Level 9 Flate/zlib compression without altering bitmap pixel matrices. Ideal for legal, signed, or vector-heavy PDFs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Deep Compression: Ghostscript 10.08.0 WASM
              </div>
              <p className="text-slate-400 leading-relaxed">
                Leverages Artifex's high-level <strong className="text-slate-300">pdfwrite</strong> device in WebAssembly. Applies intelligent bicubic downsampling (100–200 DPI) and native DCTEncode QFactor downsampling directly inside browser Web Workers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-indigo-200">
                Zero Cloud Upload & Unlimited Privacy
              </p>
              <p className="text-slate-400 leading-relaxed">
                Unlike online converters that transmit your private documents to third-party cloud servers, Quantum Hub PDF Compressor runs 100% inside your browser's WebAssembly sandbox. Your financial reports, IDs, and confidential documents never leave your device.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-bold text-slate-200 text-sm">
                Quantum Hub PDF Compressor
              </p>
              <p className="text-slate-500">
                Open-source client-side PDF optimization utility licensed under GNU AGPL v3.0.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-indigo-400 transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-indigo-400 transition-colors"
              >
                Terms of Use
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('licenses')}
                className="hover:text-indigo-400 transition-colors"
              >
                Licenses & Notices
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('source')}
                className="hover:text-indigo-400 transition-colors font-medium text-indigo-400"
              >
                AGPL Source Code
              </button>
              <span className="text-slate-700">•</span>
              <a
                href="https://quantumtools.site"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1 text-slate-400"
              >
                Quantum Hub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <p>
              Ghostscript is a registered trademark of Artifex Software, Inc. Distributed in compliance with GNU Affero GPL v3.0.
            </p>
            <p>
              Deployed with ₹0 infrastructure cost on Cloudflare Pages.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal & Info Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                {activeModal === 'privacy' && <Lock className="w-5 h-5 text-emerald-400" />}
                {activeModal === 'terms' && <FileCheck className="w-5 h-5 text-indigo-400" />}
                {activeModal === 'licenses' && <Scale className="w-5 h-5 text-amber-400" />}
                {activeModal === 'source' && <Code2 className="w-5 h-5 text-indigo-400" />}
                {activeModal === 'how-it-works' && <Cpu className="w-5 h-5 text-indigo-400" />}

                <h3 className="font-bold text-slate-100 text-lg">
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'licenses' && 'Licenses & Third-Party Notices'}
                  {activeModal === 'source' && 'Open Source & AGPL-3.0 Disclosure'}
                  {activeModal === 'how-it-works' && 'How Browser Compression Works'}
                </h3>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
              {activeModal === 'privacy' && (
                <>
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-200 font-medium">
                    Strict Zero-Server Privacy: Your files never leave your device.
                  </div>
                  <h4 className="font-bold text-white text-base">1. Document Processing</h4>
                  <p>
                    Quantum Hub PDF Compressor operates exclusively inside your browser via WebAssembly (qpdf and Ghostscript). The application does not transmit, upload, inspect, copy, or store your PDF files on any remote server.
                  </p>
                  <h4 className="font-bold text-white text-base">2. Analytics & Cookies</h4>
                  <p>
                    We do not collect telemetry on your document contents, filenames, or page data. Standard static asset requests and potential non-personalized ad delivery through Google AdSense follow Google's standard web privacy policies.
                  </p>
                  <h4 className="font-bold text-white text-base">3. Client-Side Security</h4>
                  <p>
                    Once the application assets (JavaScript, HTML, CSS, WASM modules) are loaded into your browser cache, the compression engine executes entirely within your browser's isolated sandbox memory.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <h4 className="font-bold text-white text-base">1. Acceptance of Terms</h4>
                  <p>
                    By using Quantum Hub PDF Compressor, you agree to these terms. The tool is provided free of charge for personal and commercial use under the GNU Affero General Public License version 3.
                  </p>
                  <h4 className="font-bold text-white text-base">2. Disclaimer of Warranty</h4>
                  <p className="text-slate-400 italic">
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                  </p>
                  <h4 className="font-bold text-white text-base">3. Document Integrity</h4>
                  <p>
                    Always maintain backup copies of your critical original documents before performing lossy compression or file transformations.
                  </p>
                </>
              )}

              {activeModal === 'licenses' && (
                <>
                  <h4 className="font-bold text-white text-base">Application License</h4>
                  <p>
                    Quantum Hub PDF Compressor is licensed under the <strong>GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)</strong>.
                  </p>

                  <h4 className="font-bold text-white text-base">Ghostscript 10.08.0 (WASM)</h4>
                  <p>
                    Licensed under <strong>GNU Affero General Public License v3.0 or later</strong> by Artifex Software, Inc. Bundled WebAssembly distribution by WASM Zoo (`@wasm-zoo/ghostscript`). See `LICENSE-Ghostscript.txt` for details.
                  </p>

                  <h4 className="font-bold text-white text-base">qpdf WebAssembly</h4>
                  <p>
                    Powered by `pdfstudio` / Jay Berkenbilt's qpdf, licensed under Apache-2.0 and Artistic License 2.0.
                  </p>

                  <h4 className="font-bold text-white text-base">pdf-lib</h4>
                  <p>
                    Copyright (c) 2019 Andrew Dillon. Licensed under the MIT License.
                  </p>
                </>
              )}

              {activeModal === 'source' && (
                <>
                  <h4 className="font-bold text-white text-base">AGPL-3.0 Source Disclosure</h4>
                  <p>
                    In strict compliance with Section 13 of the GNU Affero General Public License (AGPL-3.0), the complete source code required to build and run this public compressor is freely available.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <p className="font-mono text-xs text-indigo-300">
                      GitHub: https://github.com/Sanketp899/quantum-hub-pdf-compressor
                    </p>
                    <a
                      href="https://github.com/Sanketp899/quantum-hub-pdf-compressor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                      View Public GitHub Repository
                    </a>
                  </div>
                  <p className="text-xs text-slate-400">
                    This public AGPL application runs independently from the private Quantum Hub site at `quantumtools.site`.
                  </p>
                </>
              )}

              {activeModal === 'how-it-works' && (
                <>
                  <h4 className="font-bold text-white text-base">The Dual-Engine Approach</h4>
                  <p>
                    Most web-based PDF compressors use slow or insecure server uploads. Quantum Hub uses browser-native WebAssembly to achieve high compression rates directly on your machine:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-1 text-slate-300">
                    <li>
                      <strong className="text-white">Lossless Mode (qpdf WASM):</strong> Strips redundant internal cross-reference tables, generates compact object streams, and re-encodes stream payloads using maximum Flate deflate. Perfect for retaining 100% vector and text sharpness.
                    </li>
                    <li>
                      <strong className="text-white">Balanced, Maximum, Extreme (Ghostscript WASM):</strong> Executes Ghostscript 10.08.0's `pdfwrite` device inside an isolated Web Worker. Downsamples embedded raster images using bicubic interpolation and applies native QFactor DCT encoding.
                    </li>
                  </ul>
                  <p className="text-xs text-slate-400 mt-2">
                    Before outputting the final file, the engine tests multiple downsample candidates and automatically keeps the smallest valid candidate.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

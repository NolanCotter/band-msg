"use client";

import { useState } from "react";

type Platform = "android" | "iphone";

interface PwaIntroModalProps {
  onUseWebOnly: () => void;
  onCompletePwa: (platform: Platform) => void;
}

export default function PwaIntroModal({ onUseWebOnly, onCompletePwa }: PwaIntroModalProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#2b2d31] shadow-xl ring-1 ring-white/10">
        <div className="border-b border-[#3f4147] px-5 py-4">
          <h2 className="text-xl font-bold text-white">Get the best Band Chat experience</h2>
          <p className="mt-1 text-sm text-gray-400">Install as an app or keep using web only.</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-300">Choose your device</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlatform("android")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${platform === "android" ? "bg-[#5865f2] text-white" : "bg-[#404249] text-gray-300 hover:bg-[#4e5058]"}`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setPlatform("iphone")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${platform === "iphone" ? "bg-[#5865f2] text-white" : "bg-[#404249] text-gray-300 hover:bg-[#4e5058]"}`}
              >
                iPhone
              </button>
            </div>
          </div>

          {platform === "android" && (
            <div className="rounded-lg bg-[#1e1f22] px-3 py-3 text-sm text-gray-300">
              <p className="font-semibold text-white">Android (Chrome)</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-400">
                <li>Tap the browser menu (⋮).</li>
                <li>Tap <span className="font-semibold text-gray-300">Install app</span> or <span className="font-semibold text-gray-300">Add to Home screen</span>.</li>
                <li>Confirm install.</li>
              </ol>
            </div>
          )}

          {platform === "iphone" && (
            <div className="rounded-lg bg-[#1e1f22] px-3 py-3 text-sm text-gray-300">
              <p className="font-semibold text-white">iPhone (Safari)</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-400">
                <li>Tap the <span className="font-semibold text-gray-300">Share</span> button.</li>
                <li>Select <span className="font-semibold text-gray-300">Add to Home Screen</span>.</li>
                <li>Tap <span className="font-semibold text-gray-300">Add</span>.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#3f4147] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onUseWebOnly}
            className="rounded-lg bg-[#404249] px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#4e5058]"
          >
            Use Web Only
          </button>
          <button
            type="button"
            onClick={() => platform && onCompletePwa(platform)}
            disabled={!platform}
            className="rounded-lg bg-[#5865f2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752c4] disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

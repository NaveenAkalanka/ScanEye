import { useState } from "react";

export default function CopyBox({ text, label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    {label}
                </label>
            )}
            <div className="flex gap-3 items-center">
                <div className="flex-1 bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-color)] font-mono text-sm text-[var(--text-primary)] overflow-x-auto">
                    {text}
                </div>
                <button
                    onClick={handleCopy}
                    className={`btn-secondary flex items-center gap-2 whitespace-nowrap transition-all ${copied ? 'bg-[var(--accent-success)] bg-opacity-20 border-[var(--accent-success)]' : ''
                        }`}
                >
                    {copied ? (
                        <>
                            <svg className="w-5 h-5 text-[var(--accent-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[var(--accent-success)]">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

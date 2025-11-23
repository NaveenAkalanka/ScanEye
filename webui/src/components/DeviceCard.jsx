export default function DeviceCard({ device, index }) {
    return (
        <div
            className="device-card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="status-badge bg-[var(--accent-success)] bg-opacity-20 text-[var(--accent-success)]">
                    Online
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="text-sm text-[var(--text-muted)] mb-1">IP Address</div>
                    <div className="font-mono text-lg font-semibold text-[var(--accent-primary)]">
                        {device.ip}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-sm text-[var(--text-muted)] mb-1">Hostname</div>
                        <div className="text-sm font-medium truncate">
                            {device.hostname || <span className="text-[var(--text-muted)]">Unknown</span>}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-[var(--text-muted)] mb-1">Vendor</div>
                        <div className="text-sm font-medium truncate">
                            {device.vendor || <span className="text-[var(--text-muted)]">Unknown</span>}
                        </div>
                    </div>
                </div>

                {device.mac && (
                    <div>
                        <div className="text-sm text-[var(--text-muted)] mb-1">MAC Address</div>
                        <div className="font-mono text-xs text-[var(--text-secondary)]">
                            {device.mac}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

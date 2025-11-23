import axios from "axios";
import { useState, useEffect } from "react";


export default function Scan() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [subnet, setSubnet] = useState("");
    const [lastScanTime, setLastScanTime] = useState(null);

    // Fetch initial data and set up WebSocket
    useEffect(() => {
        fetchData();

        // Connect to WebSocket for real-time updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    function handleWebSocketMessage(message) {
        const { event, data } = message;

        switch (event) {
            case 'scan:started':
                setScanning(true);
                setLoading(true);
                break;

            case 'scan:complete':
                setScanning(false);
                setLoading(false);
                if (data.error) {
                    setError(`Scan failed: ${data.error}`);
                } else {
                    setError(null);
                }
                // Refresh config to get updated lastScanTime
                fetchConfig();
                break;

            case 'devices:updated':
                setDevices(data.devices || []);
                break;

            case 'config:updated':
                // Subnet or intervals changed
                fetchConfig();
                break;

            default:
                break;
        }
    }

    async function fetchData() {
        try {
            await fetchConfig();
            const resultsRes = await axios.get("/api/results");
            setDevices(resultsRes.data.devices || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch scan data:", err);
            setError("Failed to connect to backend.");
            setLoading(false);
        }
    }

    async function fetchConfig() {
        try {
            const configRes = await axios.get("/api/config");
            const netRes = await axios.get("/api/network-info");

            const displaySubnet = configRes.data.manualSubnet || netRes.data.defaultSubnet;
            setSubnet(displaySubnet);
            setLastScanTime(configRes.data.lastScanTime);
        } catch (err) {
            console.error("Failed to fetch config:", err);
        }
    }

    const handleScanNow = async () => {
        if (scanning) return;

        try {
            setScanning(true);
            await axios.post("/api/scan/trigger");
            // WebSocket will handle the rest via events
        } catch (err) {
            console.error("Failed to trigger scan:", err);
            setError("Failed to trigger scan");
            setScanning(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] shadow-lg p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">Network Scanner</h2>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                            Monitoring devices on your network
                        </p>
                    </div>
                    <button
                        onClick={handleScanNow}
                        disabled={scanning}
                        className={`w-full sm:w-auto text-[var(--text-primary)] px-6 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${scanning
                            ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] border-transparent hover:opacity-90'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {scanning ? 'Scanning...' : 'Scan Now'}
                    </button>
                </div>

                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-color)] mt-6">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Monitored Subnet
                        </label>
                        <div className="font-mono text-[var(--accent-primary)] font-semibold text-sm sm:text-base break-all">
                            {subnet || "Detecting..."}
                        </div>
                    </div>
                    <div className="flex-1 sm:border-l border-[var(--border-color)] sm:pl-4">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Last Scan
                        </label>
                        <div className="text-[var(--text-primary)] text-sm sm:text-base">
                            {lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : "Pending..."}
                        </div>
                    </div>
                    <div className="flex-1 sm:border-l border-[var(--border-color)] sm:pl-4">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Devices Found
                        </label>
                        <div className="text-[var(--accent-success)] font-bold text-lg sm:text-xl">
                            {devices.length}
                        </div>
                    </div>
                </div>

                {!subnet && (
                    <div className="mt-4 text-sm text-[var(--accent-danger)] bg-red-900 bg-opacity-20 p-3 rounded border border-red-900">
                        ⚠️ No subnet detected. Please configure a manual subnet in <a href="/settings" className="underline font-bold">Settings</a>.
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Results - Desktop Table / Mobile Cards */}
            {devices.length > 0 ? (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
                                        <th className="p-4 font-semibold text-[var(--text-secondary)]">Status</th>
                                        <th className="p-4 font-semibold text-[var(--text-secondary)]">IP Address</th>
                                        <th className="p-4 font-semibold text-[var(--text-secondary)]">MAC Address</th>
                                        <th className="p-4 font-semibold text-[var(--text-secondary)]">Hostname</th>
                                        <th className="p-4 font-semibold text-[var(--text-secondary)]">Vendor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {devices.map((dev, i) => (
                                        <tr key={i} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="p-4">
                                                <span className="inline-block w-3 h-3 rounded-full bg-[var(--accent-success)] shadow-[0_0_10px_var(--accent-success)]"></span>
                                            </td>
                                            <td className="p-4 font-mono text-[var(--accent-primary)]">{dev.ip}</td>
                                            <td className="p-4 font-mono text-sm">{dev.mac || "Unknown"}</td>
                                            <td className="p-4 text-[var(--text-primary)]">{dev.hostname || "Unknown"}</td>
                                            <td className="p-4 text-[var(--text-secondary)] text-sm">{dev.vendor || "Unknown"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {devices.map((dev, i) => (
                            <div key={i} className="card p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-[var(--accent-success)] shadow-[0_0_10px_var(--accent-success)]"></span>
                                        <span className="font-mono text-[var(--accent-primary)] font-semibold">{dev.ip}</span>
                                    </div>
                                </div>
                                <div className="text-sm space-y-1 pl-5">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">MAC:</span>
                                        <span className="font-mono text-[var(--text-primary)]">{dev.mac || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Hostname:</span>
                                        <span className="text-[var(--text-primary)]">{dev.hostname || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Vendor:</span>
                                        <span className="text-[var(--text-primary)]">{dev.vendor || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] shadow-lg p-8 sm:p-12 text-center">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No Devices Found</h3>
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                        Waiting for the next scheduled scan...
                    </p>
                </div>
            )}

        </div>
    );
}

import { useState, useEffect } from "react";
import axios from "axios";
import CopyBox from "../components/CopyBox";


export default function ApiSettings() {
    const apiBase = window.location.origin + "/api";
    const [networkInfo, setNetworkInfo] = useState([]);
    const [config, setConfig] = useState({ scanInterval: 60, speedTestInterval: 60, manualSubnet: "" });
    const [saved, setSaved] = useState(false);
    const [noNetworkDetected, setNoNetworkDetected] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [netRes, configRes] = await Promise.all([
                    axios.get("/api/network-info"),
                    axios.get("/api/config")
                ]);
                setNetworkInfo(netRes.data.networks || []);
                setConfig(configRes.data);

                const activeSubnet = configRes.data.manualSubnet || netRes.data.defaultSubnet;
                if (!activeSubnet) {
                    setNoNetworkDetected(true);
                } else {
                    setNoNetworkDetected(false);
                }
            } catch (err) {
                console.error("Failed to fetch settings data:", err);
            }
        }
        fetchData();
    }, []);

    const saveConfig = async (newConfigPartial) => {
        try {
            await axios.post("/api/config", newConfigPartial);
            setConfig(prev => ({ ...prev, ...newConfigPartial }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            if (newConfigPartial.manualSubnet !== undefined) {
                if (newConfigPartial.manualSubnet) {
                    setNoNetworkDetected(false);
                }
            }
        } catch (err) {
            console.error("Failed to save config:", err);
        }
    };

    const handleIntervalChange = (e) => {
        saveConfig({ scanInterval: parseInt(e.target.value) });
    };

    const handleSpeedTestIntervalChange = (e) => {
        saveConfig({ speedTestInterval: parseInt(e.target.value) });
    };

    const handleSubnetSave = () => {
        saveConfig({ manualSubnet: config.manualSubnet });
    };

    const handleSubnetClear = () => {
        saveConfig({ manualSubnet: "" });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card p-4 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">Configuration</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                    Manage your network scanning settings and API configuration
                </p>
            </div>

            <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scan Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Auto-Scan Interval
                        </label>
                        <select
                            value={config.scanInterval}
                            onChange={handleIntervalChange}
                            className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all w-full"
                        >
                            <option value={10}>Every 10 Seconds</option>
                            <option value={30}>Every 30 Seconds</option>
                            <option value={60}>Every 1 Minute</option>
                            <option value={600}>Every 10 Minutes</option>
                            <option value={1800}>Every 30 Minutes</option>
                        </select>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Frequency of device discovery scans.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Speed Test Interval
                        </label>
                        <select
                            value={config.speedTestInterval || 60}
                            onChange={handleSpeedTestIntervalChange}
                            className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all w-full"
                        >
                            <option value={10}>Every 10 Minutes</option>
                            <option value={20}>Every 20 Minutes</option>
                            <option value={30}>Every 30 Minutes</option>
                            <option value={60}>Every 1 Hour</option>
                            <option value={120}>Every 2 Hours</option>
                        </select>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Frequency of internet speed tests.
                        </p>
                    </div>
                </div>

                <div className={noNetworkDetected ? "p-4 border-2 border-[var(--accent-danger)] rounded-lg bg-[var(--accent-danger)]/5" : ""}>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                        Manual Subnet Override
                        {noNetworkDetected && <span className="text-[var(--accent-danger)] text-xs font-bold uppercase tracking-wider">(Required)</span>}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                        {noNetworkDetected
                            ? "Auto-detection failed. Please enter your subnet manually (e.g., 192.168.1.0/24) to enable scanning."
                            : "If auto-detection fails, enter the subnet manually here. This will be used for all scheduled scans."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={config.manualSubnet || ""}
                            onChange={(e) => setConfig({ ...config, manualSubnet: e.target.value })}
                            placeholder="e.g., 192.168.1.0/24"
                            className={`flex-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${noNetworkDetected && !config.manualSubnet ? 'border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]' : 'border-[var(--border-color)] focus:ring-[var(--accent-primary)] focus:border-transparent'}`}
                        />
                        <button
                            onClick={handleSubnetSave}
                            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                            Save
                        </button>
                        {config.manualSubnet && (
                            <button
                                onClick={handleSubnetClear}
                                className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-6 py-2 rounded-lg font-semibold border border-[var(--border-color)] transition-all duration-300 hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {saved && (
                        <div className="mt-3 text-sm text-[var(--accent-success)] flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Configuration saved!
                        </div>
                    )}
                </div>
            </div>

            <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Detected Networks
                </h2>
                {networkInfo.length > 0 ? (
                    <div className="space-y-2">
                        {networkInfo.map((net, i) => (
                            <div key={i} className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-color)]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <div className="font-medium text-[var(--text-primary)]">{net.name}</div>
                                        <div className="text-sm text-[var(--text-secondary)] break-all">
                                            IP: <span className="font-mono text-[var(--accent-primary)]">{net.address}</span>
                                            {" "} | Subnet: <span className="font-mono text-[var(--accent-primary)]">{net.subnet}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[var(--text-secondary)]">No networks detected.</p>
                )}
            </div>

            <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">API Information</h2>
                <CopyBox text={apiBase} label="Base URL" />
            </div>

        </div>
    );
}

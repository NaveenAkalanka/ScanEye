import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import scanEyeLogo from "../assets/ScanEye.svg";


export default function Dashboard() {
    const [stats, setStats] = useState({
        networkName: "Detecting...",
        subnet: "...",
        activeNodes: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        ping: 0,
        lastSpeedTest: null,
        hasNetwork: true
    });
    const [isTestingSpeed, setIsTestingSpeed] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    // Progress bar animation
    useEffect(() => {
        let progressInterval;
        if (isTestingSpeed) {
            setProgress(0);
            // Simulate progress up to 90% over 15 seconds
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return 90;
                    return prev + (90 / 150); // Increment to reach 90 in ~150 steps (15s / 100ms)
                });
            }, 100);
        } else {
            setProgress(0);
        }
        return () => clearInterval(progressInterval);
    }, [isTestingSpeed]);

    async function fetchStats() {
        try {
            const [configRes, netRes, resultsRes] = await Promise.all([
                axios.get("/api/config"),
                axios.get("/api/network-info"),
                axios.get("/api/results")
            ]);

            const config = configRes.data;
            const networks = netRes.data.networks || [];
            const devices = resultsRes.data.devices || [];

            // Find active network name
            const activeSubnet = config.manualSubnet || netRes.data.defaultSubnet;
            const activeNet = networks.find(n => n.subnet === activeSubnet);
            const networkName = activeNet ? activeNet.name : (activeSubnet ? "Unknown Interface" : "No Network");

            setStats({
                networkName,
                subnet: activeSubnet || "Not Configured",
                activeNodes: devices.length,
                downloadSpeed: config.networkSpeed || 0,
                uploadSpeed: config.uploadSpeed || 0,
                ping: config.ping || 0,
                lastSpeedTest: config.lastSpeedTest,
                hasNetwork: !!activeSubnet
            });
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        }
    }

    const handleRunSpeedTest = async () => {
        if (isTestingSpeed) return;
        setIsTestingSpeed(true);

        try {
            await axios.get("/api/speed-test");
            setProgress(100); // Jump to 100% on completion
            await fetchStats(); // Refresh stats immediately after test
        } catch (err) {
            console.error("Manual speed test failed:", err);
        } finally {
            // Small delay to show 100% before resetting
            setTimeout(() => {
                setIsTestingSpeed(false);
            }, 500);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "Never";
        return new Date(isoString).toLocaleString();
    };

    const features = [
        {
            title: "Network Scanner",
            description: "Discover all devices on your local network with advanced Nmap scanning",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            link: "/scan",
            bgColor: "bg-[var(--accent-primary)]"
        },
        {
            title: "API Configuration",
            description: "View and manage your API endpoints and integration settings",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            link: "/settings",
            bgColor: "bg-[var(--accent-secondary)]"
        }
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pt-10">
            {/* Header */}
            <div className="text-center space-y-3 sm:space-y-4 px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">Welcome to ScanEye</h1>
                <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto">
                    Advanced network scanning and monitoring tool powered by Nmap
                </p>
            </div>

            {/* No Network Warning */}
            {!stats.hasNetwork && (
                <div className="bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)] text-[var(--accent-danger)] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold text-sm sm:text-base">No Network Detected! Please configure the subnet manually.</span>
                    </div>
                    <Link to="/settings" className="w-full sm:w-auto bg-[var(--accent-danger)] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition-colors text-center">
                        Go to Settings
                    </Link>
                </div>
            )}

            {/* Real-time Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card p-4 sm:p-6 text-center space-y-2">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Network</div>
                    <div className="text-lg sm:text-xl font-bold text-[var(--accent-primary)] truncate" title={stats.subnet}>
                        {stats.networkName}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono break-all">{stats.subnet}</div>
                </div>
                <div className="card p-4 sm:p-6 text-center space-y-2">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Active Nodes</div>
                    <div className="text-3xl sm:text-4xl font-bold text-[var(--accent-success)]">{stats.activeNodes}</div>
                    <div className="text-[10px] sm:text-xs text-[var(--text-muted)]">Devices Online</div>
                </div>
                <div className="card p-4 sm:p-6 text-center space-y-2 relative group">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Download</div>

                    {isTestingSpeed ? (
                        <div className="w-full h-10 flex flex-col justify-center items-center gap-1">
                            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-[var(--accent-secondary)] h-2.5 rounded-full transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-[var(--accent-secondary)] font-bold animate-pulse">Testing... {Math.round(progress)}%</span>
                        </div>
                    ) : (
                        <div className="text-3xl sm:text-4xl font-bold text-[var(--accent-secondary)] flex items-center justify-center gap-2">
                            {stats.downloadSpeed ? stats.downloadSpeed : "--"}
                        </div>
                    )}

                    <div className="text-[10px] sm:text-xs text-[var(--text-muted)]">Mbps</div>

                    {/* Manual Speed Test Button */}
                    <button
                        onClick={handleRunSpeedTest}
                        disabled={isTestingSpeed}
                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all"
                        title="Run Speed Test Now"
                    >
                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isTestingSpeed ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
                <div className="card p-4 sm:p-6 text-center space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="text-xs sm:text-sm text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Upload / Ping</div>
                        <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                            {isTestingSpeed ? "..." : (stats.uploadSpeed ? stats.uploadSpeed : "--")} <span className="text-xs sm:text-sm text-[var(--text-muted)]">Mbps</span>
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                            Ping: <span className="text-[var(--accent-primary)] font-bold">{isTestingSpeed ? "..." : (stats.ping ? stats.ping : "--")}</span> ms
                        </div>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-2 border-t border-[var(--border-color)] pt-2">
                        Last Test: {formatDate(stats.lastSpeedTest)}
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {features.map((feature, index) => (
                    <Link
                        key={index}
                        to={feature.link}
                        className="card card-hover p-8 group"
                    >
                        <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            {feature.icon}
                        </div>
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                            {feature.title}
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            {feature.description}
                        </p>
                        <div className="mt-4 flex items-center text-[var(--accent-primary)] font-medium">
                            <span>Get Started</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
}

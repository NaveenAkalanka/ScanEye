import { getConfig, updateConfig } from './configManager.js';
import { runFastScan } from './network.js';
import { getDefaultSubnet } from './networkDetect.js';
import { runSpeedTest } from './speedTest.js';
import { broadcast } from './websocket.js';

let scanIntervalId = null;
let speedTestIntervalId = null;
let latestScanResults = [];
let isScanning = false;

export async function startScheduler() {
    const config = await getConfig();
    // Default to 60 seconds if not set or invalid
    const intervalSeconds = config.scanInterval || 60;
    // Default to 60 minutes if not set or invalid
    const speedTestIntervalMinutes = config.speedTestInterval || 60;

    console.log(`Starting scheduler with Scan Interval: ${intervalSeconds}s, Speed Test Interval: ${speedTestIntervalMinutes}m`);

    // Always run initial scan and speed test on startup
    console.log("Running initial scan and speed test on startup...");
    runScheduledScan();
    runScheduledSpeedTest();

    // Clear existing intervals
    if (scanIntervalId) clearInterval(scanIntervalId);
    if (speedTestIntervalId) clearInterval(speedTestIntervalId);

    // Set new interval for device scan (seconds)
    scanIntervalId = setInterval(runScheduledScan, intervalSeconds * 1000);

    // Run speed test (minutes)
    speedTestIntervalId = setInterval(runScheduledSpeedTest, speedTestIntervalMinutes * 60 * 1000);
}

async function runScheduledSpeedTest() {
    try {
        console.log("Starting speed test...");
        const result = await runSpeedTest();
        await updateConfig({
            networkSpeed: result.downloadSpeed,
            uploadSpeed: result.uploadSpeed,
            ping: result.ping,
            lastSpeedTest: result.timestamp
        });
        console.log(`Speed test complete: ${result.downloadSpeed} Mbps Down / ${result.uploadSpeed} Mbps Up`);
    } catch (error) {
        console.error("Speed test failed:", error);
    }
}

export async function runScheduledScan() {
    if (isScanning) return;
    isScanning = true;

    try {
        console.log("Starting scheduled scan...");
        broadcast('scan:started', {});

        const config = await getConfig();

        // Determine subnet: Manual > Auto-detect
        let subnet = config.manualSubnet;
        if (!subnet) {
            subnet = getDefaultSubnet();
        }

        if (!subnet) {
            console.warn("No subnet detected and no manual subnet configured. Skipping scan.");
            broadcast('scan:complete', { deviceCount: 0, error: 'No subnet configured' });
            return;
        }

        console.log(`Scanning subnet: ${subnet}`);
        const devices = await runFastScan(subnet);

        // Update results and last scan time
        latestScanResults = devices;
        await updateConfig({ lastScanTime: new Date().toISOString() });

        console.log(`Scan complete. Found ${devices.length} devices.`);
        broadcast('scan:complete', { deviceCount: devices.length, subnet });
        broadcast('devices:updated', { devices });
    } catch (error) {
        console.error("Scheduled scan failed:", error);
        broadcast('scan:complete', { deviceCount: 0, error: error.message });
    } finally {
        isScanning = false;
    }
}

export function getLatestResults() {
    return latestScanResults;
}

export async function updateSchedulerInterval(settings) {
    // settings can contain scanInterval (seconds) or speedTestInterval (minutes)
    await updateConfig(settings);
    await startScheduler(); // Restart with new intervals
    broadcast('config:updated', settings);
}

// Allow manual trigger of speed test
export async function triggerSpeedTest() {
    return runScheduledSpeedTest();
}

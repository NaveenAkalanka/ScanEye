import express from "express";
import { runFastScan } from "../utils/network.js";
import { getDefaultSubnet, getNetworkInfo } from "../utils/networkDetect.js";
import { getConfig, updateConfig } from "../utils/configManager.js";
import { getLatestResults, updateSchedulerInterval, runScheduledScan, triggerSpeedTest } from "../utils/scheduler.js";
import { broadcast } from "../utils/websocket.js";

const router = express.Router();

// Get network information
router.get("/network-info", (req, res) => {
    try {
        const networkInfo = getNetworkInfo();
        const defaultSubnet = getDefaultSubnet();
        res.json({
            networks: networkInfo,
            defaultSubnet
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to get network info" });
    }
});

// Get current configuration
router.get("/config", async (req, res) => {
    try {
        const config = await getConfig();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: "Failed to get config" });
    }
});

// Update configuration
router.post("/config", async (req, res) => {
    try {
        const { scanInterval, speedTestInterval, manualSubnet } = req.body;

        if (scanInterval || speedTestInterval) {
            const updates = {};
            if (scanInterval) updates.scanInterval = parseInt(scanInterval);
            if (speedTestInterval) updates.speedTestInterval = parseInt(speedTestInterval);
            await updateSchedulerInterval(updates);
        }

        if (manualSubnet !== undefined) {
            await updateConfig({ manualSubnet });
            broadcast('config:updated', { manualSubnet });
            // Trigger a scan if subnet changed
            runScheduledScan();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update config" });
    }
});

// Get latest scan results (from memory)
router.get("/results", (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const devices = getLatestResults();
    res.json({ devices });
});

// Manual Speed Test
router.get("/speed-test", async (req, res) => {
    try {
        await triggerSpeedTest();
        const config = await getConfig();
        res.json({
            speed: config.networkSpeed,
            upload: config.uploadSpeed,
            ping: config.ping,
            timestamp: config.lastSpeedTest
        });
    } catch (err) {
        res.status(500).json({ error: "Speed test failed" });
    }
});

// Manual Scan (Optional - triggers immediate scan)
router.get("/scan", async (req, res) => {
    try {
        // Use provided subnet or auto-detect
        const subnet = req.query.subnet || getDefaultSubnet();

        if (!subnet) {
            return res.status(400).json({ error: "No subnet detected. Please configure a manual subnet." });
        }

        const devices = await runFastScan(subnet);
        res.json({ devices, subnet });
    } catch (err) {
        res.status(500).json({ error: "Scan failed" });
    }
});

// Manual Scan Trigger (triggers scheduled scan immediately)
router.post("/scan/trigger", async (req, res) => {
    try {
        // Trigger the scheduled scan (which will broadcast events)
        runScheduledScan(); // Don't await, let it run in background
        res.json({ success: true, message: "Scan triggered" });
    } catch (err) {
        res.status(500).json({ error: "Failed to trigger scan" });
    }
});

export default router;

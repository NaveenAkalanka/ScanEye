import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
    scanInterval: 60, // Minutes
    speedTestInterval: 60, // Minutes
    manualSubnet: "",
    lastScanTime: null
};

// Ensure config file and directory exist
async function ensureConfig() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(CONFIG_PATH);
    } catch {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
}

// Read configuration
export async function getConfig() {
    await ensureConfig();
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (error) {
        console.error("Error reading config:", error);
        return DEFAULT_CONFIG;
    }
}

// Update configuration
export async function updateConfig(newConfig) {
    await ensureConfig();
    try {
        const currentConfig = await getConfig();
        const updatedConfig = { ...currentConfig, ...newConfig };
        await fs.writeFile(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));
        return updatedConfig;
    } catch (error) {
        console.error("Error writing config:", error);
        throw error;
    }
}

import pkg from "node-nmap";
import IPCIDR from "ip-cidr";
const { NmapScan } = pkg;

export const runFastScan = async (subnet) => {
    return new Promise((resolve, reject) => {
        // Validate Subnet
        if (!IPCIDR.isValidCIDR(subnet)) {
            return reject(new Error("Invalid subnet format. Expected CIDR notation (e.g., 192.168.1.0/24)."));
        }

        // Use ping scan (-sn) to discover all active hosts
        // This is faster and finds all devices, not just those with specific ports open
        const scan = new NmapScan(subnet, "-sn -T4 --min-parallelism 50");

        scan.on("complete", data => {
            const devices = data.map(d => ({
                ip: d.ip,
                hostname: d.hostname || null,
                mac: d.mac || null,
                vendor: d.vendor || null
            }));
            resolve(devices);
        });

        scan.on("error", reject);
        scan.startScan();
    });
};

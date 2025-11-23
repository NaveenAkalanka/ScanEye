import os from "os";

// Get the default network interface and calculate subnet
export function getDefaultSubnet() {
    try {
        const interfaces = os.networkInterfaces();

        // Find the first non-internal IPv4 interface
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                // Skip internal (loopback) and non-IPv4 addresses
                if (!iface.internal && iface.family === 'IPv4') {
                    const ip = iface.address;
                    const netmask = iface.netmask;

                    // Calculate network address and CIDR
                    const subnet = calculateSubnet(ip, netmask);
                    return subnet;
                }
            }
        }

        // Return null if no interface found
        return null;
    } catch (error) {
        console.error('Error detecting network:', error);
        return null;
    }
}

// Calculate subnet from IP and netmask
function calculateSubnet(ip, netmask) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = netmask.split('.').map(Number);

    // Calculate network address
    const networkParts = ipParts.map((part, i) => part & maskParts[i]);
    const networkAddress = networkParts.join('.');

    // Calculate CIDR notation
    const cidr = maskParts.reduce((sum, part) => {
        return sum + part.toString(2).split('1').length - 1;
    }, 0);

    return `${networkAddress}/${cidr}`;
}

// Get network info for display
export function getNetworkInfo() {
    try {
        const interfaces = os.networkInterfaces();
        const networkInfo = [];

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (!iface.internal && iface.family === 'IPv4') {
                    networkInfo.push({
                        name,
                        address: iface.address,
                        netmask: iface.netmask,
                        subnet: calculateSubnet(iface.address, iface.netmask)
                    });
                }
            }
        }

        return networkInfo;
    } catch (error) {
        console.error('Error getting network info:', error);
        return [];
    }
}

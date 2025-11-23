import speedTest from 'speedtest-net';

export async function runSpeedTest() {
    return new Promise(async (resolve, reject) => {
        try {
            // Accept license and run test
            const options = { acceptLicense: true, acceptGdpr: true };
            const result = await speedTest(options);

            resolve({
                downloadSpeed: (result.download.bandwidth / 125000).toFixed(2), // Convert bytes/sec to Mbps
                uploadSpeed: (result.upload.bandwidth / 125000).toFixed(2),     // Convert bytes/sec to Mbps
                ping: result.ping.latency.toFixed(0),
                isp: result.isp,
                server: result.server.name,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            reject(new Error(`Speed test failed: ${err.message}`));
        }
    });
}

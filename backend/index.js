import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import scanRoutes from "./routes/scan.js";
import { startScheduler } from "./utils/scheduler.js";
import { initWebSocket } from "./utils/websocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'"], // Allow Vite's inline scripts
            "upgrade-insecure-requests": null,
        },
    },
    strictTransportSecurity: false, // Disable HSTS for local network (HTTP)
    crossOriginOpenerPolicy: false // Disable COOP to prevent issues with non-secure origins
}));
app.use(morgan("combined"));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs (increased for frontend polling)
    message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

app.use(cors());
app.use(express.json());

// Serve API routes first
app.use("/api", scanRoutes);

// Serve static frontend files
const distPath = path.join(__dirname, "../webui/dist");
app.use(express.static(distPath));

// Fallback to index.html for client-side routing (SPA)
app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

const PORT = 5050;
const server = createServer(app);

// Initialize WebSocket server
initWebSocket(server);

server.listen(PORT, () => {
    console.log(`ScanEye API running on port ${PORT}`);
    startScheduler();
});

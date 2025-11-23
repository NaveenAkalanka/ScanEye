FROM node:18

# Install Nmap for network scanning
RUN apt-get update && apt-get install -y nmap && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p data

COPY backend ./backend
COPY webui ./webui

RUN cd backend && npm install
RUN cd webui && npm install && npm run build

EXPOSE 5050

CMD ["node", "backend/index.js"]

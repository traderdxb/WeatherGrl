# TempVeritas Dashboard

Professional-grade, real-time weather intelligence dashboard that cross-validates temperatures from Weather Company (WC) and ECMWF forecast models.

## Features

- Real-time temperature monitoring for major global cities.
- Cross-validation between WC and ECMWF models.
- Automated refresh every 60 seconds.
- Variance analysis and trend tracking.
- Operational-grade dashboard with source fallback.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, lucide-react
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Deployment**: Docker, Nginx

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional)

### Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build

To build the application for production:

```bash
npm run build
```

The output will be in the `dist` directory.

## Deployment with Docker

### Using Docker Compose (Recommended)

1. Ensure you have Docker and Docker Compose installed.
2. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```
3. The dashboard will be available at `http://localhost:8080`.

### Using Dockerfile

1. Build the image:
   ```bash
   docker build -t tempveritas-dashboard .
   ```
2. Run the container:
   ```bash
   docker run -d -p 80:80 tempveritas-dashboard
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WC_API_KEY` | Weather Company API Key | `placeholder` |
| `VITE_ECMWF_API_KEY` | ECMWF API Key | `placeholder` |
| `VITE_REFRESH_INTERVAL_MS` | Refresh interval in ms | `60000` |

## License

Proprietary - TempVeritas

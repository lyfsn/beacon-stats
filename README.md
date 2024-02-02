# Ethereum Beacon Node Monitoring Dashboard

## Overview

This project provides a real-time monitoring dashboard for Ethereum Beacon nodes, designed to offer insights into various node metrics such as peer count and connectivity status. The dashboard is built using Vue.js for the frontend and Fastify for the backend, with WebSocket communication enabling live updates. This solution is aimed at developers and network administrators looking for an easy way to monitor the health and performance of their Ethereum Beacon nodes.

## Features

- **Real-Time Updates:** Utilizes WebSockets for live monitoring of node status, including peer count.
- **Configurable Node List:** Supports multiple nodes with customizable names and URLs via a YAML configuration file.
- **Progress Indicators:** Displays a progress bar that fills as data is being fetched or updated.
- **Responsive Design:** A user-friendly interface that adapts to different screen sizes, ensuring accessibility on various devices.
- **Error Handling:** Provides feedback on connectivity issues or errors in data fetching to enhance troubleshooting.

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.
- Node.js and npm installed for local development and testing (optional).

### Installation

1. **Clone the repository:**

   ```
   git clone https://github.com/lyfsn/beacon-stats
   ```

2. **Navigate to the project directory:**

   ```
   cd beacon-stats
   ```

3. **Start the project:**

   Run the `start.sh` script to build and start the frontend and backend services using Docker Compose. This script orchestrates the setup and ensures all components are up and running.

   ```
   ./start.sh
   ```

### Configuration

- Modify the `config.yml` file in the project root to add or change the Ethereum Beacon nodes you want to monitor. Format as follows:

  ```
  nodes:
    node1: http://localhost:5052
    node2: http://localhost:5053
  ```

- This configuration will be automatically applied to the backend service, dynamically adjusting the nodes being monitored.

### Accessing the Dashboard

- After starting the services, the dashboard will be accessible at `http://localhost:3000` from your web browser.
- The backend service listens on port `8080`, but interaction is primarily through the frontend interface.

## Development

For local development, you can run the frontend and backend separately outside Docker:

- **Frontend:** Navigate to the `beacon-stats` directory and use npm or yarn to install dependencies and start the development server.
- **Backend:** Navigate to the `beacon-stats-server` directory, install dependencies, and start the Fastify server.

Refer to the respective `package.json` files for specific commands.

## Contributing

Contributions are welcome! Please refer to the project's contribution guidelines for more details on how to participate.

## License

Specify the license under which your project is released, e.g., MIT, Apache, etc.

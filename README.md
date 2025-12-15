# AutoRepair Manager

A comprehensive web application for managing an auto repair workshop. This system handles everything from client and vehicle management to repair tracking and finished product delivery.

Frontend demo available (secure backend not publicly accessible).:
   ```bash
   https://github.com/mohamedwardi068/BusAtelierDeploy
   ```
## Features

- **Authentication**: Secure login system with role-based access (Admin/User).
- **Reception Management**: Track incoming vehicles, assign clients, and record initial observations.
- **Repair Tracking**: Monitor the status of repairs (Received, In Progress, Finished).
- **Parts Management**: Manage inventory of spare parts (Pieces).
- **Finished Products**: Track completed repairs and manage delivery to clients.
- **Recap & Analytics**: View monthly summaries of finished and returned products with financial calculations.
- **User Management**: Admin tools to add and remove users.

## Tech Stack

- **Frontend**: React.js
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: React Context API
- **Data**: Simulated Backend (Fake API) with LocalStorage persistence

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd BusManger-main
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```
The application will open in your browser at `http://localhost:3000`.

## Usage

### Default Credentials

You can log in using the following credentials:

- **Admin Account**:
  - Username: `admin`
  - Password: `admin`

- **User Account**:
  - Username: `user`
  - Password: `user`

### Key Workflows

1. **Reception**: Add a new reception entry when a vehicle arrives. Select client and vehicle model.
2. **In Progress**: Update status to "En cours" when work begins. Add spare parts used.
3. **Finish**: Mark as "Finit" when work is done. Add a serial number if applicable.
4. **Delivery**: Mark finished products as delivered to the client.
5. **Returns**: Handle product returns with reason tracking.

## Note

This application currently runs with a **mock backend**. All data is stored in your browser's `localStorage`. Clearing your browser cache will reset the data.
# BusAtelierDeploy



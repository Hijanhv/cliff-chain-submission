# Chain Cliff Submission - Token Vesting DApp

This project is a Solana-based token vesting application designed to manage employee token vesting schedules efficiently and transparently. Built with **Turborepo**, it features a monorepo architecture for managing the frontend, backend, and smart contract layers seamlessly.

---

## Overview

The **Chain Cliff Submission** is a dApp that leverages Solana blockchain and **Turborepo** to streamline the token vesting process for organizations. With modular architecture, the project is scalable and easy to extend. It supports custom vesting schedules, wallet integration, and cluster management.

---

## Key Features

1.  **Token Vesting**

    - Create and manage vesting accounts for organizations.
    - Define customizable vesting schedules for employees (start time, end time, cliff, allocation).
    - Claim vested tokens directly through the app.

2.  **Cluster Management**

    - Switch between Solana clusters (Devnet, Testnet, Localnet).
    - Add and configure custom cluster endpoints.

3.  **Wallet Integration**

    - Seamless connection with Solana wallets using **@solana/wallet-adapter**.
    - View balances, transaction history, and interact with token accounts.

4.  **Turborepo Architecture**

    - Monorepo structure for managing frontend, backend, and smart contracts efficiently.
    - Build and deploy components independently for faster development.

---

## Tech Stack

- **Blockchain**: Solana, Anchor
- **Frontend**: Next.js, Tailwind CSS
- **State Management**: React Query, Jotai
- **Monorepo Tool**: Turborepo
- **Languages**: TypeScript, Rust
- **Wallet Support**: Solana Wallet Adapter

---

## Project Structure

```bash
.
├── apps/
│   ├── frontend/       # Next.js app for the frontend
│   ├── api/            # Backend API (if applicable)
├── packages/
│   ├── anchor/         # Anchor programs (Solana smart contracts)
│   ├── ui/             # Shared UI components (React, Tailwind)
│   ├── utils/          # Shared utility functions
└── turbo.json          # Turborepo configuration

```

---

## Installation and Setup

### Prerequisites

- **Node.js** and **Yarn** (monorepo package manager)
- **Rust** and **Anchor CLI** for Solana smart contracts
- Solana CLI (for deploying and interacting with programs)

### Steps

1.  Clone the repository:

    ```bash
    git clone https://github.com/Hijanhv/cliff-chain-submission
    cd chain_cliff_submission
    ```

2.  Install dependencies for all apps and packages:

    ```bash
    npm install

    ```

3.  Build the entire monorepo using Turborepo:

    ```bash
    turbo build

    ```

4.  Deploy Anchor programs:

    ```bash
    turbo deploy --filter=anchor

    ```

5.  Update the program ID in the frontend:

    Edit `apps/frontend/constants/index.ts` and set `NEXT_PUBLIC_VESTING_PROGRAM_ID` to your deployed program ID.

6.  Start the development server for the frontend:

    ```bash
    turbo dev --filter=frontend

    ```

7.  Open the application in your browser at `http://localhost:3000`.

---

## Turborepo Workflow

### Common Commands

- **Install Dependencies**:  
  Installs dependencies for all apps and packages.

  ```bash
  yarn install

  ```

- **Build**:  
  Builds the entire monorepo workspace using Turborepo.

  ```bash
  turbo build

  ```

- **Deploy Contracts**:  
  Deploys Solana smart contracts with Turborepo.

  ```bash
  turbo deploy --filter=anchor

  ```

- **Run Frontend**:  
  Starts the Next.js development server.

  ```bash
  turbo dev --filter=frontend

  ```

- **Clean**:  
  Removes all generated files (dist, cache, etc.).

  ```bash
  turbo clean

  ```

---

## Usage

### 1. Configure Clusters

- Add cluster endpoints via the **Cluster Management** page.
- Easily switch between Devnet, Testnet, and Localnet.

### 2. Create Vesting Accounts

- Go to the **Vesting** page.
- Define vesting schedules for employees with parameters like start time, cliff, and total allocation.

### 3. Claim Tokens

- Employees can claim their vested tokens based on the schedule.

---

## Smart Contract Overview

### Anchor Program

- **Modules:**

  - `create_vesting_account`: Initialize vesting accounts for organizations.
  - `create_employee_vesting`: Assign vesting schedules to employees.
  - `claim_tokens`: Allow employees to claim vested tokens.

- **Accounts:**

  - `VestingAccount`: Tracks company-specific vesting details.
  - `EmployeeAccount`: Stores individual employee vesting schedules.

---

## Development Notes

1.  **Anchor Tests**

    - Write and run tests for smart contracts in `packages/anchor/tests/`.
    - Run tests with:

      ```bash
      turbo test --filter=anchor
      ```

2.  **Shared Components**
    - Shared React components are stored in `packages/ui/`.
    - Import them into the frontend for reuse.
3.  **Cluster Configuration**

    - Customize cluster endpoints in `apps/frontend/constants/clusters.ts`.

---

## License

This project is open-source and licensed under the [MIT License](https://chatgpt.com/c/LICENSE).

---

## Contributing

We welcome contributions! To contribute:

1.  Fork the repository.
2.  Create a feature branch.
3.  Submit a pull request with your changes.

---

## Contact

- **Name**: [Janhavi Chavada](mailto:janhavichavada11@gmail.com)
- **GitHub**: [My Github](https://github.com/hijanhv)

---

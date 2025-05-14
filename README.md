# Arvo Project

## Overview

**Arvo** is a project for tokenizing government bonds as Real World Assets (RWAs). The project is organized as a monorepo with multiple packages.

---

## 📂 Project Structure

The project is structured as a monorepo with the following main components:

### Core Components

- **Arvo Program**
  The central smart contract built using the Anchor framework that provides functionality for managing vaults, users, and token operations.

### Web Applications

- **Main Application (`@arvo/app`)**
  User-facing Next.js application for interacting with the Arvo program.
- **Admin CLI (`@arvo/admin`)**
  Command-line tools for administrative operations.
- **Documentation Site (`@arvo/docs`)**
  Documentation and component showcase.

### Shared Libraries

- **UI Component Library (`@arvo/ui`)**
  Shared UI components used across applications.
- **Configuration Packages**
  Shared TypeScript and Tailwind configurations.

---

## 🗂 Directory Structure

```
arvo/
├── apps/                  # User-facing applications
│   ├── admin/             # Admin CLI tools
│   ├── app/               # Main user application
│   └── docs/              # Documentation site
├── packages/              # Shared libraries and core functionality
│   ├── program/           # Smart contract
│   └── ui/                # Shared UI components
└── configs/               # Shared configurations
    ├── config-typescript/ # TypeScript configuration
    └── config-tailwind/   # Tailwind CSS configuration
```

---

## ⚙️ Program Functionality

The Arvo program provides **nine primary instructions** that form its core functionality:

| **Instruction** | **Description**                       | **Parameters**   |
| --------------- | ------------------------------------- | ---------------- |
| `initialize`    | Sets up the initial program state     | `InitializeArgs` |
| `create_vault`  | Creates a new vault for token storage | None             |
| `add_user`      | Adds a user to the system             | `user: Pubkey`   |
| `deposit`       | Deposits tokens into a vault          | `amount: u64`    |
| `withdraw`      | Withdraws tokens from a vault         | `amount: u64`    |
| `collect`       | Collects deposited tokens             | None             |
| `redeem`        | Redeems tokens for underlying assets  | None             |
| `update_rate`   | Updates interest or exchange rate     | `rate: i16`      |
| `remove_user`   | Removes a user from the system        | `user: Pubkey`   |

---

## 🛠 Technical Stack

### Frontend

- **Next.js**: React framework for the main application
- **React**: UI library for building interfaces
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools

- **Turborepo**: Build system orchestration
- **pnpm**: Package manager
- **Vitest**: Testing framework
- **Biome**: Linting and formatting

### Prerequisites

To work with the Arvo codebase, you'll need:

- Rust 1.86.0
- Node.js: Version 22.14.0 or higher ci.yaml:48
- PNPM: Version 10.10.0 or higher

### Getting Started

Clone the repository

```
git clone https://github.com/tobeycodes/arvo.git
cd arvo
```

Install dependencies using PNPM

`pnpm install`

Start development servers for all packages

`pnpm dev`

#### Development Commands

| Command          | Description                                     |
| ---------------- | ----------------------------------------------- |
| pnpm dev         | Start development servers for all packages      |
| pnpm build       | Build all packages ci.yaml:145-146              |
| pnpm test        | Run tests across all packages                   |
| pnpm coverage    | Run tests with coverage reporting               |
| pnpm lint        | Run linting across all packages ci.yaml:124-125 |
| pnpm check-types | Run TypeScript type checking ci.yaml:166-167    |
| pnpm clean       | Clean build artifacts and dependencies          |

# To run commands for a specific package, use:

`pnpm --filter <package-name> <command>`

# For example:

To run Anchor tests only

`pnpm --filter @arvo/program test`

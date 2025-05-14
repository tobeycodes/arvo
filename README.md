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

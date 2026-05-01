# JanNidhi Tracker

A blockchain-backed public fund tracking system with role-based dashboards, audit flags, and citizen transparency.

## Monorepo Structure

```
frontend/   React + Vite UI
backend/    Node.js + Express API
blockchain/ Hardhat + Solidity contracts
database/   Local MongoDB notes
resources/  Planning docs (ignored by git)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally
- Git

## Quick Start

### 1) Blockchain (Hardhat)

```bash
cd blockchain
npm install
npm run node
```

In a second terminal:

```bash
cd blockchain
npm run deploy
```

Copy the three contract addresses into `backend/.env`.

### 2) Backend API

```bash
cd backend
npm install
```

Create `backend/.env` from the example:

```bash
copy .env.example .env
```

Update contract addresses and private key in `backend/.env`.

Seed demo users:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

API will run on `http://localhost:5000`.

### 3) Frontend UI

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`.

## Demo Login Accounts

- Super Admin: `admin@finmin.gov.in` / `Admin@1234`
- Ministry Admin: `secretary@mohfw.gov.in` / `Ministry@1234`
- State Admin: `finance@maharashtra.gov.in` / `State@1234`
- District Admin: `collector@pune.gov.in` / `District@1234`
- CAG Auditor: `cag@cagindia.gov.in` / `CAG@12345`

## Environment Variables

See [backend/.env.example](backend/.env.example) for all required variables. Do not commit real secrets.

## Notes

- The `resources/` folder is ignored by git by design.
- ABI JSON files should be copied to `backend/abis/` after contract compile.

## Scripts Summary

### Backend

- `npm run dev` - start API with nodemon
- `npm run seed` - seed demo users

### Blockchain

- `npm run node` - start local Hardhat node
- `npm run deploy` - deploy contracts

### Frontend

- `npm run dev` - start UI

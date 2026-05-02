# 🎓 Complete End-to-End Workflow — Scholarship Scheme (Centre to Student)

---

## Manual QA Checklist (Latest UI Fixes)

Use this section to test only the recent fixes manually.

### 1) Pre-Setup (One Time)

1. Open two terminals.
2. In terminal A (backend):
```bash
cd "d:\AVTIVE PROJ\JanNidhi Tracker\backend"
npm install
npm run dev
```
3. In terminal B (frontend):
```bash
cd "d:\AVTIVE PROJ\JanNidhi Tracker\frontend"
npm install
npm run dev
```
4. Open the app URL shown by Vite (usually `http://localhost:5173`).
5. Login as Super Admin.
6. Keep MetaMask unlocked for allocation testing.

### 2) Test: Dashboard Sankey Graph

1. Go to Super Admin Dashboard.
2. Check card `Fund Flow Sankey (Finance to Ministries)`.
3. Hover each Sankey flow link.
4. Expected:
   - Graph is not a single unusable filled block.
   - Tooltip shows `Allocation: Rs ... Cr`.
   - Tooltip shows `Share: ...%`.
   - Multiple ministry links are visible separately.
5. If no data exists, expected fallback message:
   - `No allocation data yet for Sankey view.`

### 3) Test: Transaction `View` Button

1. Go to Super Admin -> Budget History / Transactions page.
2. In table, click `View` on a row.
3. Expected:
   - Button text changes to `Viewing` for selected row.
   - Page scrolls to `Transaction Details`.
   - Details panel updates with selected transaction id/hash/amount.
4. Click `View` on another row and confirm details switch correctly.

### 4) Test: Fund Allocation Step Loader + Completion

1. Go to Super Admin -> Allocate Budget.
2. Select ministry and amount.
3. Click `Confirm & Allocate on Blockchain`.
4. Expected progression:
   - `Connecting MetaMask...` (if wallet not connected)
   - `Waiting for MetaMask confirmation...`
   - `Saving to database...`
   - `Allocation completed successfully.`
5. In `Transaction Status` card verify markers:
   - `[x]` completed step
   - `[~]` current step
   - `[ ]` pending step
6. Final expected:
   - State becomes `SUCCESS`.
   - `Allocation Submitted` card appears with transaction id + tx hash + block number.

### 5) Test: Create Ministry Success Message

1. Go to Super Admin -> Create Ministry Account.
2. Fill required fields and submit.
3. Expected:
   - During run: step messages like `Validating details...`, `Creating ministry account...`
   - After success: clear success message shown (backend message or fallback)
   - `Success` card shows wallet address, tx hash, block number.
4. Click `Reset` and verify:
   - Error, success message, and result card are cleared.

### 6) Negative Testing (Important)

1. Allocate budget with invalid amount (`0` or empty):
   - Expected: `Please enter a valid allocation amount.`
2. Create ministry with missing required fields:
   - Expected: `Please fill all required fields.`
3. Reject MetaMask transaction intentionally:
   - Expected: error shown, state becomes failed.

### 7) Quick Pass/Fail Sheet

Mark each as `PASS` or `FAIL`:

- Sankey graph readable and tooltip correct
- Transaction view selects row and scrolls to details
- Allocation step loader shows stage-by-stage flow
- Allocation success message and submitted data shown
- Create ministry success message shown and reset works

### 8) Known Review Risk (Please Validate)

Current code risk found in allocation flow:
- In `SAAllocateBudget`, wallet connect helper swallows connect errors internally.
- If MetaMask connect fails, submit flow may still continue to next call and fail later with a less clear error.
- Recommendation: re-throw connect failure from `handleConnectWallet()` or return success/fail explicitly and stop submit early.

---

## 🎯 OUR EXAMPLE SCHEME

```
SCHEME NAME: PM Scholarship for Higher Education
SHORT NAME:  PMSS
TYPE:        Central Sector Scheme (100% Centre Funded)
AMOUNT:      ₹50,000/year per student
TARGET:      Students of Maharashtra State
MINISTRY:    Ministry of Education
```

---

# 📍 STAGE 0: BUDGET DECLARATION (Parliament)

---

## What Happens in Real Life

```
February 1, 2024 — Finance Minister presents Union Budget
Parliament approves:
"Ministry of Education gets ₹1,04,000 Crore for FY 2024-25"
Inside that:
"PM Scholarship Scheme gets ₹6,000 Crore"

This Parliament approval becomes the
LEGAL BASIS for all money movement
Nothing moves without this approval
```

---

## What Gets Stored — Budget Declaration

```
╔══════════════════════════════════════════════════════════╗
║          BUDGET DECLARATION BLOCK                        ║
║          (This is the ROOT BLOCK — Block #1)             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:      "BUDGET_DECLARATION"              │ ║
║  │  financialYear:  "2024-25"                         │ ║
║  │  totalBudget:    104000  (crore)                   │ ║
║  │  ministry:       "Ministry of Education"           │ ║
║  │  approvedBy:     "Parliament of India"             │ ║
║  │  billReference:  "Appropriation Bill 2024-AB-14"   │ ║
║  │  docHash:        "Qm7f9x2..."  ← PDF on IPFS       │ ║
║  │  timestamp:      1706745600                        │ ║
║  │  blockHash:      "0xa3f9c2e8..."                   │ ║
║  │  prevBlockHash:  "0x000000..."  ← Genesis block    │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB:                                             ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  budgetId:       "BUDGET-2024-25-MOED"             │ ║
║  │  financialYear:  "2024-25"                         │ ║
║  │  totalCrore:     104000                            │ ║
║  │  ministryName:   "Ministry of Education"           │ ║
║  │  ministryCode:   "MOED"                            │ ║
║  │  billRef:        "2024-AB-14"                      │ ║
║  │  blockchainTxHash: "0xa3f9c2e8..."                 │ ║
║  │  status:         "approved"                        │ ║
║  │  createdAt:      2024-02-01                        │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝

WHY STORE ON BLOCKCHAIN:
→ Parliament approval cannot be tampered with
→ This is the legal ROOT of all future transactions
→ Every rupee movement traces back to this block
```

---

# 📍 STAGE 1: SUPER ADMIN CREATES MINISTRY ACCOUNT

---

## What Happens

```
Super Admin (Finance Ministry Officer) logs into system
Creates account for Ministry of Education
Generates a Blockchain Wallet for Education Ministry
This wallet will HOLD all funds for Education Ministry
```

---

## Transaction Flow

```
SUPER ADMIN ACTION:
"Create Ministry of Education Account"

INPUT DATA:
→ Ministry Name: Ministry of Education
→ Ministry Code: MOED
→ HOD Name: Dr. Dharmendra Pradhan
→ Designation: Secretary, MoE
→ Email: sec.moe@gov.in
→ Employee ID: IAS-1998-UP-0045
→ Phone: 9XXXXXXXXX
→ Budget Cap: ₹1,04,000 Crore (FY 2024-25)
```

---

## What Gets Stored

```
╔══════════════════════════════════════════════════════════╗
║       MINISTRY CREATION — BLOCKCHAIN + DB                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN (Smart Contract Call):                    ║
║  Function: createMinistry()                              ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:       "MINISTRY_CREATED"               │ ║
║  │  ministryCode:    "MOED"                           │ ║
║  │  ministryName:    "Ministry of Education"          │ ║
║  │  walletAddress:   "0x4a9f2c8b..."  ← Auto created  │ ║
║  │  budgetCapCrore:  104000                           │ ║
║  │  createdBy:       "0x1a2b3c..."   ← Super Admin    │ ║
║  │  timestamp:       1707350400                       │ ║
║  │  blockHash:       "0xb7e2d4f1..."                  │ ║
║  │  prevBlockHash:   "0xa3f9c2e8..."  ← Budget block  │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (User Collection):                           ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  _id:            ObjectId("64f2a...")              │ ║
║  │  fullName:       "Dr. Dharmendra Pradhan"          │ ║
║  │  email:          "sec.moe@gov.in"                  │ ║
║  │  password:       [bcrypt hashed]                   │ ║
║  │  employeeId:     "IAS-1998-UP-0045"                │ ║
║  │  phone:          "9XXXXXXXXX"                      │ ║
║  │  role:           "ministry_admin"                  │ ║
║  │  jurisdiction: {                                   │ ║
║  │    ministry:     "Ministry of Education"           │ ║
║  │    ministryCode: "MOED"                            │ ║
║  │  }                                                 │ ║
║  │  walletAddress:  "0x4a9f2c8b..."                   │ ║
║  │  budgetCapCrore: 104000                            │ ║
║  │  createdBy:      ObjectId("SuperAdmin_id")         │ ║
║  │  blockchainTxHash: "0xb7e2d4f1..."                 │ ║
║  │  isActive:       true                              │ ║
║  │  isFirstLogin:   true                              │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 2: CAG AUDITOR IS ASSIGNED

---

## What Happens

```
Super Admin creates CAG account
IMMEDIATELY after system setup
CAG account gets READ access to EVERYTHING
CAG watches from Day 1 — not Year 3
```

---

## What Gets Stored

```
╔══════════════════════════════════════════════════════════╗
║           CAG ACCOUNT CREATION                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:      "CAG_ASSIGNED"                    │ ║
║  │  cagWallet:      "0xcag123..."                     │ ║
║  │  accessLevel:    "READ_ALL"                        │ ║
║  │  assignedBy:     "0x1a2b3c..."  ← Super Admin      │ ║
║  │  jurisdiction:   "NATIONAL"                        │ ║
║  │  timestamp:      1707436800                        │ ║
║  │  blockHash:      "0xc9d4e7f2..."                   │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB:                                             ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  fullName:    "Girish Murmu"                       │ ║
║  │  role:        "central_cag"                        │ ║
║  │  walletAddress: "0xcag123..."                      │ ║
║  │  jurisdiction: { state: null }  ← All India        │ ║
║  │  blockchainTxHash: "0xc9d4e7f2..."                 │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  WHAT CAG CAN SEE FROM THIS MOMENT:                      ║
║  → Every transaction that happens anywhere in India      ║
║  → Every ministry creation                               ║
║  → Every scheme creation                                 ║
║  → Every fund release                                    ║
║  → Every payment to beneficiary                          ║
║  → IN REAL-TIME — not 2 years later ✅                   ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 3: MINISTRY CREATES THE SCHOLARSHIP SCHEME

---

## What Happens

```
Ministry of Education logs in
Creates "PM Scholarship Scheme" (PMSS)
Rules are locked in Smart Contract forever
Once created — NO ONE CAN CHANGE THE RULES
```

---

## Input Details for Scheme Creation

```
MINISTRY OF EDUCATION FILLS THIS FORM:

Scheme Name:           PM Scholarship for Higher Education
Scheme Short Code:     PMSS
Scheme Type:           Central Sector (100% Centre Funded)
Total Budget:          ₹6,000 Crore (from allocated amount)
Per Beneficiary:       ₹50,000 per year per student
Payment Schedule:      2 installments (₹25,000 each)
                       Installment 1: June
                       Installment 2: December
Target States:         Maharashtra (for our example)
Target Beneficiaries:  12,00,000 students
Start Date:            01-Apr-2024
End Date:              31-Mar-2025

ELIGIBILITY RULES (Locked in Smart Contract):
Rule 1: Must be Indian citizen (Aadhaar mandatory)
Rule 2: Must be enrolled in recognized college/university
Rule 3: Family annual income < ₹4.5 Lakh
Rule 4: Must have passed 12th with 60%+ marks
Rule 5: Age between 18-25 years
Rule 6: Not receiving any other central scholarship
Rule 7: Must have Aadhaar-linked bank account

Documents Required:
→ Aadhaar Card
→ 12th Marksheet
→ College Admission Letter
→ Income Certificate from Tehsildar
→ Bank Passbook (for IFSC verification)
```

---

## What Gets Stored

```
╔══════════════════════════════════════════════════════════╗
║          SCHEME CREATION — BLOCKCHAIN + DB               ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN (SchemeRegistry Contract):                ║
║  Function: createScheme()                                ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:        "SCHEME_CREATED"                │ ║
║  │  schemeId:         "MOED-CSS-2024-PMSS-001"        │ ║
║  │  schemeName:       "PM Scholarship Higher Edu"     │ ║
║  │  ministryWallet:   "0x4a9f2c8b..."                 │ ║
║  │  totalBudget:      6000  (crore)                   │ ║
║  │  perBeneficiary:   50000 (rupees)                  │ ║
║  │  rulesHash:        "0xrules789..."                  │ ║
║  │  ← SHA256 of all eligibility rules LOCKED HERE     │ ║
║  │  guidelineDocHash: "Qm3x9f2..."  ← IPFS hash       │ ║
║  │  approvalDocHash:  "Qmb7e2d..."  ← IPFS hash       │ ║
║  │  schemeType:       "CENTRAL_SECTOR"                │ ║
║  │  createdBy:        "0x4a9f2c8b..."  ← MoE wallet   │ ║
║  │  timestamp:        1707523200                      │ ║
║  │  blockHash:        "0xd8f3a6c9..."                 │ ║
║  │  prevBlockHash:    "0xc9d4e7f2..."                 │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (Scheme Collection):                         ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  schemeId:       "MOED-CSS-2024-PMSS-001"          │ ║
║  │  schemeName:     "PM Scholarship Higher Edu"       │ ║
║  │  description:    "Annual scholarship for..."       │ ║
║  │  ownerMinistryCode: "MOED"                         │ ║
║  │  schemeType:     "central_sector"                  │ ║
║  │  fundingRatioCentre: 100                           │ ║
║  │  fundingRatioState:  0                             │ ║
║  │  totalBudgetCrore: 6000                            │ ║
║  │  perBeneficiaryAmount: 50000                       │ ║
║  │  beneficiaryAmountType: "annual"                   │ ║
║  │  targetBeneficiaries: 1200000                      │ ║
║  │  installments: [                                   │ ║
║  │    { number: 1, amount: 25000, month: "June" },    │ ║
║  │    { number: 2, amount: 25000, month: "December" } │ ║
║  │  ]                                                 │ ║
║  │  eligibilityRules: [                               │ ║
║  │    { code: "CITIZEN", text: "Indian citizen..." }, │ ║
║  │    { code: "ENROLLED", text: "Recognized college"},│ ║
║  │    { code: "INCOME", text: "Family < 4.5L/yr" },  │ ║
║  │    { code: "MARKS", text: "12th 60%+ required" }, │ ║
║  │    { code: "AGE", text: "18-25 years" },           │ ║
║  │    { code: "NO_DUPLICATE", text: "No other..." }  │ ║
║  │  ]                                                 │ ║
║  │  applicableStates: ["MH"]                          │ ║
║  │  startDate:      2024-04-01                        │ ║
║  │  endDate:        2025-03-31                        │ ║
║  │  guidelineDocHash: "Qm3x9f2..."                    │ ║
║  │  blockchainTxHash: "0xd8f3a6c9..."                 │ ║
║  │  blockNumber:    48291                             │ ║
║  │  status:         "active"                          │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝

WHAT HAPPENS IMMEDIATELY:
→ All State Admins under MoE see PMSS in their scheme list
→ CAG Dashboard: "New scheme created — PMSS — ₹6000 Cr"
→ Public Portal: PMSS appears in scheme search
→ Rules are LOCKED — nobody can change them ever ✅
```

---

# 📍 STAGE 4: SUPER ADMIN ALLOCATES BUDGET TO MINISTRY

---

## What Happens

```
Super Admin releases ₹6,000 Crore specifically
for PM Scholarship Scheme to Ministry of Education's wallet

This is the FIRST REAL MONEY MOVEMENT
on the blockchain
```

---

## Transaction Details

```
FROM:    Finance Ministry Wallet (0x1a2b3c...)
TO:      Ministry of Education Wallet (0x4a9f2c8b...)
AMOUNT:  ₹6,000 Crore
FOR:     PM Scholarship Scheme (PMSS)
```

---

## What Gets Stored

```
╔══════════════════════════════════════════════════════════╗
║     TRANSACTION 1: CENTRE → MINISTRY                     ║
║     Finance Ministry → Ministry of Education             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN (FundManager Contract):                   ║
║  Function: allocateBudget()                              ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:       "BUDGET_ALLOCATED"               │ ║
║  │  transactionId:   "TXN-2024-FIN-MOED-PMSS-001"    │ ║
║  │  fromWallet:      "0x1a2b3c..."  ← Finance Min     │ ║
║  │  toWallet:        "0x4a9f2c8b..." ← MoE            │ ║
║  │  amountCrore:     6000                             │ ║
║  │  schemeId:        "MOED-CSS-2024-PMSS-001"         │ ║
║  │  schemeName:      "PM Scholarship Higher Edu"      │ ║
║  │  financialYear:   "2024-25"                        │ ║
║  │  quarter:         "Q1"                             │ ║
║  │  sanctionDocHash: "Qmc4b7e9..."  ← IPFS            │ ║
║  │  billRef:         "2024-AB-14"                     │ ║
║  │  timestamp:       1707609600                       │ ║
║  │  blockHash:       "0xe5f8b2a7..."                  │ ║
║  │  prevBlockHash:   "0xd8f3a6c9..."  ← Scheme block  │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (Transaction Collection):                    ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  transactionId:  "TXN-2024-FIN-MOED-PMSS-001"     │ ║
║  │  blockchainTxHash: "0xe5f8b2a7..."                 │ ║
║  │  blockNumber:    48292                             │ ║
║  │  fromRole:       "super_admin"                     │ ║
║  │  fromName:       "Finance Ministry of India"       │ ║
║  │  fromWallet:     "0x1a2b3c..."                     │ ║
║  │  toRole:         "ministry_admin"                  │ ║
║  │  toName:         "Ministry of Education"           │ ║
║  │  toWallet:       "0x4a9f2c8b..."                   │ ║
║  │  amountCrore:    6000                              │ ║
║  │  schemeId:       "MOED-CSS-2024-PMSS-001"          │ ║
║  │  schemeName:     "PM Scholarship Higher Edu"       │ ║
║  │  ministryCode:   "MOED"                            │ ║
║  │  financialYear:  "2024-25"                         │ ║
║  │  sanctionDocHash: "Qmc4b7e9..."                    │ ║
║  │  status:         "confirmed"                       │ ║
║  │  isFlagged:      false                             │ ║
║  │  validations: {                                    │ ║
║  │    amountCheck: true,                              │ ║
║  │    walletCheck: true,                              │ ║
║  │    schemeActiveCheck: true                         │ ║
║  │  }                                                 │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  WHAT HAPPENS INSTANTLY:                                 ║
║  → MoE Dashboard: "₹6000 Cr received for PMSS" ✅       ║
║  → CAG Live Feed: New transaction appears 🟢             ║
║  → Public Portal: Fund allocated to MoE ✅              ║
║  → Auto-flag engine runs → No issues found 🟢           ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 5: MINISTRY CREATES STATE ACCOUNT + RELEASES FUNDS TO STATE

---

## What Happens

```
Ministry of Education creates Maharashtra State Account
Then releases ₹800 Crore to Maharashtra for PMSS

Why ₹800 Crore for Maharashtra?
→ Maharashtra has 16 lakh eligible students
→ 16 lakh × ₹50,000 = ₹800 Crore for full year
→ Released in 2 installments:
   Installment 1 (June): ₹400 Crore
   Installment 2 (Dec): ₹400 Crore
```

---

## Step A: Ministry Creates Maharashtra State Account

```
INPUT DATA:
→ State Name: Maharashtra
→ State Code: MH
→ Finance Officer: Shri Anil Dighe
→ Designation: Secretary, Higher & Tech Education
→ Email: sec.hte.mah@gov.in
→ Phone: 9XXXXXXXXX
→ Employee ID: MCS-2001-MH-0234
→ Assigned Schemes: [PMSS]
→ Budget Limit: ₹800 Crore (for PMSS)
```

---

## What Gets Stored — State Account Creation

```
╔══════════════════════════════════════════════════════════╗
║          STATE ACCOUNT CREATION                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:      "STATE_ACCOUNT_CREATED"           │ ║
║  │  stateCode:      "MH"                              │ ║
║  │  stateName:      "Maharashtra"                     │ ║
║  │  walletAddress:  "0x8c2d4f7a..."  ← Auto created   │ ║
║  │  assignedSchemes: ["MOED-CSS-2024-PMSS-001"]       │ ║
║  │  budgetLimit:    800  (crore)                      │ ║
║  │  createdBy:      "0x4a9f2c8b..."  ← MoE wallet     │ ║
║  │  timestamp:      1707696000                        │ ║
║  │  blockHash:      "0xf4c9a1e8..."                   │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB:                                             ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  fullName:    "Shri Anil Dighe"                    │ ║
║  │  role:        "state_admin"                        │ ║
║  │  jurisdiction: {                                   │ ║
║  │    ministry: "Ministry of Education"               │ ║
║  │    ministryCode: "MOED"                            │ ║
║  │    state: "Maharashtra"                            │ ║
║  │    stateCode: "MH"                                 │ ║
║  │  }                                                 │ ║
║  │  walletAddress: "0x8c2d4f7a..."                    │ ║
║  │  assignedSchemes: ["MOED-CSS-2024-PMSS-001"]       │ ║
║  │  budgetCapCrore: 800                               │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝
```

---

## Step B: Ministry Releases Funds to Maharashtra (Installment 1)

```
BEFORE RELEASING — SMART CONTRACT CHECKS:
✅ Does Maharashtra have an active account? YES
✅ Is ₹400 Cr ≤ Maharashtra's limit of ₹800 Cr? YES
✅ Is PMSS scheme active? YES
✅ Previous UC submitted? (First installment — N/A) YES
✅ MoE has ₹6000 Cr balance? YES

ALL CHECKS PASS → RELEASE PROCEEDS
```

---

## What Gets Stored — Transaction 2

```
╔══════════════════════════════════════════════════════════╗
║    TRANSACTION 2: MINISTRY → STATE                       ║
║    MoE → Maharashtra (PMSS Installment 1)                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  Function: releaseFunds()                                ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:       "FUNDS_RELEASED"                 │ ║
║  │  transactionId:   "TXN-2024-MOED-MH-PMSS-001"     │ ║
║  │  fromWallet:      "0x4a9f2c8b..."  ← MoE           │ ║
║  │  toWallet:        "0x8c2d4f7a..."  ← Maharashtra   │ ║
║  │  amountCrore:     400                              │ ║
║  │  schemeId:        "MOED-CSS-2024-PMSS-001"         │ ║
║  │  installment:     1                                │ ║
║  │  releaseDocHash:  "Qmd9e3f7..."   ← IPFS           │ ║
║  │  fromLevel:       "MINISTRY"                       │ ║
║  │  toLevel:         "STATE"                          │ ║
║  │  stateCode:       "MH"                             │ ║
║  │  timestamp:       1717200000   (June 1, 2024)      │ ║
║  │  blockHash:       "0xa7b4c2d9..."                  │ ║
║  │  prevBlockHash:   "0xf4c9a1e8..."                  │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (Transaction Collection):                    ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  transactionId:  "TXN-2024-MOED-MH-PMSS-001"      │ ║
║  │  blockchainTxHash: "0xa7b4c2d9..."                 │ ║
║  │  blockNumber:    48293                             │ ║
║  │  fromRole:       "ministry_admin"                  │ ║
║  │  fromName:       "Ministry of Education"           │ ║
║  │  fromCode:       "MOED"                            │ ║
║  │  toRole:         "state_admin"                     │ ║
║  │  toName:         "Maharashtra"                     │ ║
║  │  toCode:         "MH"                              │ ║
║  │  amountCrore:    400                               │ ║
║  │  schemeId:       "MOED-CSS-2024-PMSS-001"          │ ║
║  │  installmentNumber: 1                              │ ║
║  │  ministryCode:   "MOED"                            │ ║
║  │  stateCode:      "MH"                              │ ║
║  │  releaseDocHash: "Qmd9e3f7..."                     │ ║
║  │  status:         "confirmed"                       │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  WHAT HAPPENS INSTANTLY:                                 ║
║  → Maharashtra Dashboard: "₹400 Cr received for PMSS"   ║
║  → CAG Live Feed: 🟢 MoE → MH ₹400 Cr PMSS Block#48293 ║
║  → MoE Dashboard: Balance remaining ₹5600 Cr            ║
║  → Public Portal: Maharashtra received funds for PMSS ✅ ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 6: STATE CREATES DISTRICT ACCOUNT + RELEASES TO DISTRICT

---

## What Happens

```
Maharashtra creates Pune District account
Maharashtra releases ₹45 Crore to Pune
for PMSS (based on Pune's student population)

Pune has 90,000 eligible students
90,000 × ₹25,000 (Installment 1) = ₹225 Crore
But Maharashtra sends in tranches
First tranche to Pune: ₹45 Crore
(For first payment to ~18,000 students in first batch)
```

---

## Step A: State Creates District Account

```
Maharashtra fills:
→ District Name: Pune
→ District Code: MH-PUNE-01
→ Collector: Shri Rajesh Patil
→ Email: collector.pune@maharashtra.gov.in
→ Phone: 9XXXXXXXXX
→ Employee ID: MCS-2010-MH-1234
→ Assigned Schemes: [PMSS]
→ Budget Limit: ₹225 Crore (for PMSS)
```

---

## What Gets Stored — District Account + Transaction 3

```
╔══════════════════════════════════════════════════════════╗
║    TRANSACTION 3: STATE → DISTRICT                       ║
║    Maharashtra → Pune District (PMSS Batch 1)            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:      "FUNDS_RELEASED"                  │ ║
║  │  transactionId:  "TXN-2024-MH-PUNE-PMSS-001"      │ ║
║  │  fromWallet:     "0x8c2d4f7a..."  ← Maharashtra    │ ║
║  │  toWallet:       "0x3e9a2b5c..."  ← Pune District  │ ║
║  │  amountCrore:    45                                │ ║
║  │  schemeId:       "MOED-CSS-2024-PMSS-001"          │ ║
║  │  fromLevel:      "STATE"                           │ ║
║  │  toLevel:        "DISTRICT"                        │ ║
║  │  stateCode:      "MH"                              │ ║
║  │  districtCode:   "MH-PUNE-01"                      │ ║
║  │  ucDocHash:      null (first installment)          │ ║
║  │  timestamp:      1717286400   (June 2, 2024)       │ ║
║  │  blockHash:      "0xb8d5f3a6..."                   │ ║
║  │  prevBlockHash:  "0xa7b4c2d9..."                   │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB:                                             ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  fromRole:     "state_admin"                       │ ║
║  │  fromName:     "Maharashtra"                       │ ║
║  │  toRole:       "district_admin"                    │ ║
║  │  toName:       "Pune District"                     │ ║
║  │  amountCrore:  45                                  │ ║
║  │  schemeId:     "MOED-CSS-2024-PMSS-001"            │ ║
║  │  stateCode:    "MH"                                │ ║
║  │  districtCode: "MH-PUNE-01"                        │ ║
║  │  status:       "confirmed"                         │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 7: DISTRICT ENROLLS STUDENT AS BENEFICIARY

---

## Our Student Example

```
NAME:         Priya Sharma
AADHAAR:      2345 6789 0123
COLLEGE:      Savitribai Phule Pune University
COURSE:       B.Sc Computer Science — 2nd Year
12TH MARKS:   78% from Maharashtra HSC Board
FAMILY INCOME: ₹2.8 Lakh per year
AGE:           20 years
BANK:          Bank of Maharashtra, Shivajinagar Branch
IFSC:          MAHB0001234
ACCOUNT:       XXXX XXXX 9821 (Aadhaar linked)
```

---

## District Admin Enrollment Process — Step by Step

---

### STEP 1: AADHAAR VERIFICATION

```
District Admin enters: 2345 6789 0123

System calls Mock UIDAI API:

UIDAI RESPONSE:
✅ Name:     Priya Sharma
✅ DOB:      2004-05-12  (20 years ✅ — between 18-25)
✅ Gender:   Female
✅ State:    Maharashtra ✅ (matches scheme target state)
✅ Status:   ACTIVE

AADHAAR VERIFIED ✅
```

---

### STEP 2: BANK ACCOUNT FETCH FROM NPCI

```
System calls Mock NPCI API with Aadhaar: 2345 6789 0123

NPCI RESPONSE:
✅ Bank Name:        Bank of Maharashtra
✅ Branch:          Shivajinagar, Pune
✅ Account Masked:   XXXXXXXXXX9821
✅ IFSC:            MAHB0001234
✅ Account Status:   ACTIVE
✅ Account Type:     Savings

NOTE: District Admin CANNOT type account number manually
      Only NPCI-fetched account used — prevents fraud ✅
```

---

### STEP 3: SMART CONTRACT DUPLICATE CHECK

```
System checks blockchain for this Aadhaar hash:

CHECK 1: Already enrolled in PMSS anywhere in India?
→ Searching blockchain... NO ✅

CHECK 2: Getting any other central scholarship?
→ Checking cross-scheme registry... NO ✅

CHECK 3: Marked as deceased in civil registry?
→ Checking death records... NO ✅

CHECK 4: Aadhaar in blacklist?
→ NO ✅

ALL DUPLICATE CHECKS PASSED ✅
```

---

### STEP 4: ELIGIBILITY VERIFICATION

```
District Admin uploads documents:

DOCUMENT 1: College Admission Letter
→ Uploaded PDF → IPFS stores it
→ IPFS returns hash: "Qmcollege789..."
→ Hash stored on blockchain ✅

DOCUMENT 2: 12th Marksheet (78%)
→ Uploaded PDF → IPFS: "Qmmarks456..."
→ Hash on blockchain ✅
→ Smart Contract checks: 78% > 60% ✅

DOCUMENT 3: Income Certificate ₹2.8 Lakh
→ Uploaded PDF → IPFS: "Qmincome123..."
→ Hash on blockchain ✅
→ Smart Contract checks: ₹2.8L < ₹4.5L ✅

DOCUMENT 4: Bank Passbook (for verification)
→ Uploaded → IPFS: "Qmbank321..."
→ Hash on blockchain ✅
```

---

### STEP 5: STUDENT CONSENT OTP

```
System sends OTP to Priya's Aadhaar-linked mobile:
"Dear Priya, OTP 847291 to confirm your PMSS enrollment"

Priya (or district official in her presence) enters: 847291

OTP VERIFIED ✅
Priya herself consented to enrollment
Nobody can enroll her without her knowing ✅
```

---

### STEP 6: ENROLLMENT CONFIRMED — WHAT GETS STORED

```
╔══════════════════════════════════════════════════════════╗
║          BENEFICIARY ENROLLMENT                          ║
║          BLOCKCHAIN + DB STORAGE                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN (FundManager Contract):                   ║
║  Function: enrollBeneficiary()                           ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:        "BENEFICIARY_ENROLLED"          │ ║
║  │  enrollmentId:     "ENR-2024-MH-PUNE-PMSS-18291"  │ ║
║  │                                                    │ ║
║  │  aadhaarHash:      "f7a9b3c2e8d4..."               │ ║
║  │  ← SHA256(2345678901234 + SECRET)                  │ ║
║  │  ← RAW AADHAAR NEVER STORED ON CHAIN ✅            │ ║
║  │                                                    │ ║
║  │  bankAccountHash:  "e2c4d8f1a7b3..."               │ ║
║  │  ← SHA256(account number + SECRET)                 │ ║
║  │  ← RAW ACCOUNT NEVER STORED ✅                     │ ║
║  │                                                    │ ║
║  │  schemeId:         "MOED-CSS-2024-PMSS-001"        │ ║
║  │  stateCode:        "MH"                            │ ║
║  │  districtCode:     "MH-PUNE-01"                    │ ║
║  │                                                    │ ║
║  │  eligibilityProof: {                               │ ║
║  │    collegeDocHash: "Qmcollege789...",              │ ║
║  │    marksDocHash:   "Qmmarks456...",                │ ║
║  │    incomeDocHash:  "Qmincome123...",               │ ║
║  │    bankDocHash:    "Qmbank321..."                  │ ║
║  │  }                                                 │ ║
║  │  ← All proofs locked permanently ✅                │ ║
║  │                                                    │ ║
║  │  uidaiVerified:    true                            │ ║
║  │  npciVerified:     true                            │ ║
║  │  consentOTP:       true                            │ ║
║  │  enrolledBy:       "0x3e9a2b5c..."  ← District     │ ║
║  │  timestamp:        1717372800  (June 3, 2024)      │ ║
║  │  blockHash:        "0xc6e9f1a4..."                 │ ║
║  │  prevBlockHash:    "0xb8d5f3a6..."                 │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (Beneficiary Collection):                    ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  aadhaarHash:    "f7a9b3c2e8d4..."  ← HASHED       │ ║
║  │  aadhaarMasked:  "XXXX XXXX 0123"                  │ ║
║  │  fullName:       "Priya Sharma"     ← From UIDAI   │ ║
║  │  dateOfBirth:    2004-05-12                        │ ║
║  │  gender:         "F"                               │ ║
║  │  bankAccountHash: "e2c4d8f1..."  ← HASHED          │ ║
║  │  bankName:       "Bank of Maharashtra"             │ ║
║  │  bankBranch:     "Shivajinagar Pune"               │ ║
║  │  ifscCode:       "MAHB0001234"                     │ ║
║  │  state:          "Maharashtra"                     │ ║
║  │  district:       "Pune"                            │ ║
║  │  enrolledSchemes: [{                               │ ║
║  │    schemeId:     "MOED-CSS-2024-PMSS-001"          │ ║
║  │    schemeName:   "PM Scholarship Higher Edu"       │ ║
║  │    enrolledOn:   2024-06-03                        │ ║
║  │    status:       "active"                          │ ║
║  │    blockchainTxHash: "0xc6e9f1a4..."               │ ║
║  │  }]                                                │ ║
║  │  proofDocuments: [                                 │ ║
║  │    {docType:"college", ipfsHash:"Qmcollege789..."} │ ║
║  │    {docType:"marks",   ipfsHash:"Qmmarks456..."}   │ ║
║  │    {docType:"income",  ipfsHash:"Qmincome123..."}  │ ║
║  │  ]                                                 │ ║
║  │  isActive:       true                              │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 8: DISTRICT TRIGGERS SCHOLARSHIP PAYMENT

---

## What Happens

```
June 15, 2024 — District Admin triggers
Installment 1 payments for all enrolled students in Pune

18,000 students enrolled in Pune for PMSS
Each gets ₹25,000 (Installment 1)
Total: ₹45 Crore (which district received from state)
```

---

## Pre-Payment Smart Contract Checks on Priya

```
SMART CONTRACT RUNS THESE CHECKS ON PRIYA:

CHECK 1: Is PMSS scheme active?
→ YES ✅

CHECK 2: Is Priya's enrollment active?
→ YES ✅

CHECK 3: Has Priya already received Installment 1?
→ NO ✅ (first time)

CHECK 4: Is Priya's Aadhaar still active in UIDAI?
→ YES ✅

CHECK 5: Is Priya's bank account still active in NPCI?
→ Bank account linked: YES ✅
→ Account active: YES ✅

CHECK 6: Has bank account changed recently? (30-day cooling)
→ NO change in last 30 days ✅

CHECK 7: Is Priya marked as deceased?
→ NO ✅

ALL 7 CHECKS PASSED → PAYMENT CLEARED ✅
Amount: ₹25,000
To: NPCI Aadhaar-linked account XXXX9821
```

---

## What Gets Stored — Transaction 4 (The Actual Payment)

```
╔══════════════════════════════════════════════════════════╗
║    TRANSACTION 4: DISTRICT → BENEFICIARY PAYMENT         ║
║    Pune District → Priya Sharma (PMSS Installment 1)     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ON BLOCKCHAIN:                                          ║
║  Function: recordPayment()                               ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  blockType:       "PAYMENT_MADE"                   │ ║
║  │  paymentId:       "PAY-2024-PMSS-PUNE-18291"       │ ║
║  │  aadhaarHash:     "f7a9b3c2e8d4..."  ← Priya's    │ ║
║  │  schemeId:        "MOED-CSS-2024-PMSS-001"         │ ║
║  │  installment:     1                                │ ║
║  │  amount:          25000  (rupees)                  │ ║
║  │  bankAccountHash: "e2c4d8f1a7b3..."                │ ║
║  │  ifscCode:        "MAHB0001234"                    │ ║
║  │  districtWallet:  "0x3e9a2b5c..."  ← Pune          │ ║
║  │  stateCode:       "MH"                             │ ║
║  │  districtCode:    "MH-PUNE-01"                     │ ║
║  │  pfmsRef:         "PFMS-2024-MH-44821"  ← Mock     │ ║
║  │  npciRef:         "NPCI-APB-2024-88291" ← Mock     │ ║
║  │  bankUTR:         "MAHB24165044821"     ← Mock     │ ║
║  │  paymentStatus:   "SUCCESS"                        │ ║
║  │  timestamp:       1718409600  (June 15, 2024)      │ ║
║  │  blockHash:       "0xd7a8b3c5..."                  │ ║
║  │  prevBlockHash:   "0xc6e9f1a4..."  ← Enrollment   │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  IN MONGODB (Payment Collection):                        ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │  paymentId:      "PAY-2024-PMSS-PUNE-18291"        │ ║
║  │  blockchainTxHash: "0xd7a8b3c5..."                 │ ║
║  │  blockNumber:    48295                             │ ║
║  │  aadhaarHash:    "f7a9b3c2e8d4..."                 │ ║
║  │  beneficiaryDbId: ObjectId("...")                  │ ║
║  │  schemeId:       "MOED-CSS-2024-PMSS-001"          │ ║
║  │  schemeName:     "PM Scholarship Higher Edu"       │ ║
║  │  installmentNumber: 1                              │ ║
║  │  financialYear:  "2024-25"                         │ ║
║  │  amount:         25000                             │ ║
║  │  bankName:       "Bank of Maharashtra"             │ ║
║  │  ifscCode:       "MAHB0001234"                     │ ║
║  │  bankAccountHash: "e2c4d8f1..."                    │ ║
║  │  pfmsRef:        "PFMS-2024-MH-44821"              │ ║
║  │  npciRef:        "NPCI-APB-2024-88291"             │ ║
║  │  bankUtrNumber:  "MAHB24165044821"                 │ ║
║  │  state:          "Maharashtra"                     │ ║
║  │  district:       "Pune"                            │ ║
║  │  status:         "success"                         │ ║
║  │  paidAt:         2024-06-15T10:32:11Z              │ ║
║  │  batchId:        "BATCH-2024-PMSS-PUNE-001"        │ ║
║  └────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════╝
```

---

# 📍 STAGE 9: MONEY HITS PRIYA'S BANK ACCOUNT

---

## Actual Transfer Process

```
BLOCKCHAIN TRIGGER → PFMS API
         ↓
PFMS sends to NPCI:
"Pay ₹25,000 to Aadhaar 2345678901234"
         ↓
NPCI APB checks Aadhaar → Bank Mapper:
"2345678901234 → Bank of Maharashtra MAHB0001234"
         ↓
NPCI routes to Bank of Maharashtra:
"Credit ₹25,000 to Account XXXX9821"
         ↓
Bank of Maharashtra Credits ₹25,000
         ↓
Bank generates UTR: MAHB24165044821
         ↓
NPCI confirms back to PFMS
         ↓
PFMS confirms to our Blockchain System
         ↓
SUCCESS BLOCK created on blockchain ✅
         ↓
SMS to Priya's phone:
"₹25,000 credited to your account from
 PM Scholarship Scheme.
 Verify: Block #48295 at pmscholarship.gov.in"
```

---

# 📍 STAGE 10: CAG AUDITOR SEES EVERYTHING

---

## What CAG Dashboard Shows in Real-Time

```
╔══════════════════════════════════════════════════════════╗
║         CAG LIVE DASHBOARD — PMSS TRAIL                  ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  PMSS FUND FLOW TRAIL (Real-time):                       ║
║                                                          ║
║  Block #48291 → 01-Feb ✅                                ║
║  Budget Declaration ₹1,04,000 Cr to MoE                 ║
║                                                          ║
║  Block #48292 → 12-Feb ✅                                ║
║  Finance Min → MoE = ₹6,000 Cr (PMSS)                   ║
║                                                          ║
║  Block #48293 → 01-Jun ✅                                ║
║  MoE → Maharashtra = ₹400 Cr (PMSS Inst.1)              ║
║                                                          ║
║  Block #48294 → 02-Jun ✅                                ║
║  Maharashtra → Pune = ₹45 Cr (PMSS Batch 1)             ║
║                                                          ║
║  Block #48295 → 15-Jun ✅                                ║
║  Pune → 18,000 Students = ₹45 Cr (PMSS Inst.1)          ║
║                                                          ║
║  MONEY TRAIL: ₹6000 Cr → ₹400 Cr → ₹45 Cr → Students   ║
║                                                          ║
║  LEAKAGE CHECK:                                          ║
║  Allocated to MH: ₹400 Cr                               ║
║  Released to Districts: ₹395 Cr (so far)                ║
║  Reached Students: ₹385 Cr                              ║
║  Gap: ₹15 Cr → 🟡 MEDIUM FLAG AUTO-RAISED               ║
║  "₹15 Cr allocated to Maharashtra not yet released"      ║
║  → State has 30 days to release remaining ₹5 Cr         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## What CAG Sees If Fraud is Attempted

```
FRAUD SCENARIO:
District Admin tries to send ₹50 Cr to students
But only received ₹45 Cr from State

SMART CONTRACT CATCHES INSTANTLY:
─────────────────────────────────
"AMOUNT_OVERFLOW DETECTED"
Attempted: ₹50 Cr
Available:  ₹45 Cr
Difference: ₹5 Cr over limit

TRANSACTION BLOCKED 🚨
AUTO-FLAG RAISED: FLAG-2024-MH-PUNE-PMSS-001

CAG DASHBOARD → FLAG APPEARS IN SECONDS:
🔴 CRITICAL: Pune District PMSS
   "Attempted ₹50Cr payment, only ₹45Cr received"
   Block attempted: TXN-2024-PUNE-ATTEMPT-001
   BLOCKED by Smart Contract ✅

WITHOUT BLOCKCHAIN → CAUGHT IN 2 YEARS
WITH BLOCKCHAIN → CAUGHT IN 2 SECONDS ✅
```

---

# 📍 STAGE 11: PRIYA TRACKS HER SCHOLARSHIP

---

## What Priya Does on Public Portal

```
PRIYA OPENS: pmscholarship.gov.in/track

STEP 1: Click "Track My Scholarship"

STEP 2: Enter Aadhaar: 2345 6789 0123
        Enter OTP: 629847 (sent to her phone)
        OTP VERIFIED ✅

STEP 3: SYSTEM SHOWS:

┌────────────────────────────────────────────────────────┐
│  Hello, Priya Sharma (XXXX 0123)                       │
│                                                        │
│  PM SCHOLARSHIP FOR HIGHER EDUCATION — 2024-25         │
│                                                        │
│  INSTALLMENT 1 JOURNEY (₹25,000):                      │
│                                                        │
│  ✅ STEP 1: Parliament Approved                        │
│     Budget allocated on 01-Feb-2024                    │
│     Block: #48291 [Click to verify]                    │
│                                                        │
│  ✅ STEP 2: Ministry Released to Maharashtra           │
│     ₹400 Cr released on 01-Jun-2024                    │
│     Block: #48293 [Click to verify]                    │
│                                                        │
│  ✅ STEP 3: Maharashtra Released to Pune               │
│     ₹45 Cr released on 02-Jun-2024                     │
│     Block: #48294 [Click to verify]                    │
│                                                        │
│  ✅ STEP 4: Pune District Processed                    │
│     Payment processed on 15-Jun-2024                   │
│                                                        │
│  ✅ STEP 5: Your Account Credited                      │
│     ₹25,000 on 15-Jun-2024 10:32 AM                    │
│     Bank: Bank of Maharashtra                          │
│     UTR: MAHB24165044821                               │
│     Block: #48295 [Click to verify] ✅                 │
│                                                        │
│  INSTALLMENT 2 (₹25,000):                              │
│  ⏳ Expected: December 2024                            │
│  Status: Centre funds not yet released                 │
│  [Set Reminder] button                                 │
│                                                        │
│  IF NOT RECEIVED BY DEC 31: [Raise Complaint] button   │
└────────────────────────────────────────────────────────┘

AFTER SESSION → Aadhaar is DELETED from system
Nothing stored permanently ✅
```

---

# 📊 COMPLETE BLOCKCHAIN CHAIN — VISUAL

```
BLOCK #48291        BLOCK #48292        BLOCK #48293
┌───────────┐       ┌───────────┐       ┌───────────┐
│ BUDGET    │←HASH─→│ MoE       │←HASH─→│ MoE→MH    │
│ DECLARED  │       │ CREATED   │       │ ₹400 Cr   │
│ ₹1.04L Cr │       │ PMSS      │       │ PMSS      │
│ Hash:0xa3 │       │ Hash:0xb7 │       │ Hash:0xa7 │
└───────────┘       └───────────┘       └───────────┘
                                               ↓
BLOCK #48295        BLOCK #48294        (linked)
┌───────────┐       ┌───────────┐       ┌───────────┐
│ PAYMENT   │←HASH─→│ MH→PUNE   │←HASH─→│ PRIYA     │
│ SUCCESS   │       │ ₹45 Cr    │       │ ENROLLED  │
│ ₹25,000   │       │ PMSS      │       │ PMSS      │
│ Priya     │       │ Hash:0xb8 │       │ Hash:0xc6 │
│ Hash:0xd7 │       └───────────┘       └───────────┘
└───────────┘

EACH BLOCK CONTAINS HASH OF PREVIOUS BLOCK
= TAMPER PROOF CHAIN = NOBODY CAN MODIFY HISTORY ✅
```

---

# 📊 COMPLETE DATA STORAGE SUMMARY TABLE

```
╔═══════════════════╦══════════════════════════╦══════════════════════════╗
║ WHAT              ║ STORED ON BLOCKCHAIN     ║ STORED IN MONGODB        ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Budget            ║ Amount, Ministry,        ║ Full budget details,     ║
║ Declaration       ║ Bill ref, Doc hash       ║ all ministry breakdowns  ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Ministry          ║ Wallet address, Code,    ║ Officer details, email,  ║
║ Account           ║ Budget cap, Creator      ║ phone, designation       ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Scheme            ║ Scheme ID, Budget,       ║ Full description, all    ║
║ Creation          ║ Rules hash, Doc hashes   ║ rules text, documents    ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Fund              ║ From/To wallet, Amount,  ║ All details, filter-able ║
║ Transfer          ║ Scheme ID, Timestamp     ║ fields, status updates   ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Beneficiary       ║ Aadhaar HASH only,       ║ Name, masked Aadhaar,    ║
║ Enrollment        ║ Bank hash, Doc hashes,   ║ bank name, IFSC,         ║
║                   ║ Scheme ID, Verifications ║ documents list           ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Payment           ║ Aadhaar hash, Amount,    ║ UTR number, PFMS ref,    ║
║                   ║ Scheme ID, Status,       ║ NPCI ref, bank details,  ║
║                   ║ UTR hash                 ║ failure reasons          ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ CAG Flag          ║ Flag type, Reason,       ║ Full details, admin      ║
║                   ║ Tx hash, Timestamp       ║ response, deadlines      ║
╠═══════════════════╬══════════════════════════╬══════════════════════════╣
║ Aadhaar Number    ║ NEVER STORED — HASHED    ║ NEVER STORED — HASHED   ║
║ Bank Account      ║ NEVER STORED — HASHED    ║ NEVER STORED — HASHED   ║
╚═══════════════════╩══════════════════════════╩══════════════════════════╝

WHY SPLIT STORAGE:
→ BLOCKCHAIN: Truth, immutability, audit proof
→ MONGODB: Searchability, filtering, performance
→ Both linked via blockchainTxHash field
→ MongoDB can be searched fast
→ Blockchain cannot be tampered with
→ TOGETHER: Fast + Tamper-proof ✅
```

---

# 🔁 COMPLETE FLOW — ONE LINE EACH

```
1. Parliament approves → ROOT BLOCK created
2. Super Admin creates MoE account → BLOCK created
3. Super Admin creates CAG account → CAG watches ALL
4. MoE creates PMSS scheme → Rules LOCKED on chain
5. Finance Min releases ₹6000 Cr to MoE → BLOCK #1 (TXN)
6. MoE creates Maharashtra account → BLOCK created
7. MoE releases ₹400 Cr to Maharashtra → BLOCK #2 (TXN)
8. Maharashtra creates Pune District account → BLOCK
9. Maharashtra releases ₹45 Cr to Pune → BLOCK #3 (TXN)
10. District enrolls Priya (Aadhaar+NPCI+OTP) → BLOCK #4
11. District triggers ₹25,000 to Priya → BLOCK #5 (PAYMENT)
12. PFMS→NPCI→BankofMaharashtra credits Priya's account
13. Success block created → Priya gets SMS ✅
14. CAG saw ALL 13 steps in real-time ✅
15. Priya verifies on public portal with Aadhaar OTP ✅
16. Any fraud at any step → AUTO-FLAGGED in seconds 🚨
```

---

> 💡 **THE KEY INSIGHT:**
> **5 Transactions. 5 Blocks. 1 Unbreakable Chain.**
> Centre → Ministry → State → District → Student
> Every rupee has a **permanent digital footprint.**
> CAG sees it **in seconds** not years.
> Priya can verify it **on her phone.**
> No official can **steal or redirect** even ₹1
> because the Smart Contract is the **real gatekeeper.**
> **That is the power of Blockchain in Public Fund Management.** 🇮🇳🔗

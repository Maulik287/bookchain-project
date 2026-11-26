# BookChain — Second-Hand Book Exchange Chain with Ownership History Tracking

> **Course**: 24CIE554 – Full Stack Development  
> **Student Authors**:  
> 1. **Ashwath G Hegde** — USN: `1MS25CI404`  
> 2. **Maulik Tondwal** — USN: `1MS24CI070`  

---

## 🌟 Overview & Hero Feature

Academic book exchange on college noticeboards and social groups is often informal, hard to search, and lacks trust in book condition or authenticity.

**BookChain** solves this through a **verifiable Ownership History mechanism**:
- Every copy of an academic textbook has an immutable **"Book Journey"** paper trail.
- Tracks past student owners with **exchange dates**, **handover locations**, **condition logs**, and **academic notes/exam advice** for the next peer.
- Provides cryptographic transaction identifiers for every transfer hop.

---

## 🏗️ Three-Tier Architecture

1. **Presentation Layer (Frontend)**:
   - Built with **React.js (Vite)**, Lucide Icons, and Canvas Confetti.
   - Component-based architecture with modern glassmorphism design tokens, interactive visual timeline chain, responsive book cards, and quick role switcher.
2. **Application Layer (Backend)**:
   - Built with **Node.js & Express.js**.
   - RESTful API endpoints, JWT token authentication, bcrypt password hashing, and claim validation logic (book must be available, claimant cannot be current owner).
3. **Data Layer (Database)**:
   - Models defined with **Mongoose / MongoDB** (`Users`, `Books`, `OwnershipHistory`).
   - Seamless dual storage engine: Connects to MongoDB Atlas / local `mongod` if configured, and includes an automatic high-performance persistent store adapter (`backend/data/store.json`) so the project runs out of the box with zero external setup friction.

---

## 🚀 Quick Start Guide

### 1. Install & Launch Both Servers in 1 Command:
From the project root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

*(Alternatively, you can run `npm run server` and `npm run client` in separate terminal windows).*

---

## 🎓 Pre-Configured Test Student Accounts
Authentication uses **Student USN** as username, **Date of Birth (DOB)** (`DD-MM-YYYY`) as the credential, and **Security CAPTCHA**:

| Student Name | USN | Date of Birth (DOB) | Department | Role in Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Ashwath G Hegde** | `1MS25CI404` | `14-07-2004` | Computer Science & Eng. | Project Author & Book Owner |
| **Maulik Tondwal** | `1MS24CI070` | `20-11-2003` | Computer Science & Eng. | Project Author & Active Custodian |
| **Priya Sharma** | `1MS24CI085` | `05-03-2004` | Information Science & Eng. | Peer in Chain |
| **Rohan Deshmukh** | `1MS23CI042` | `12-09-2002` | Computer Science & Eng. | Senior (Genesis Lister) |

> 💡 **Viva / Presentation Tip**:
> - Click the **"Authenticate"** button in the navbar to open the login modal.
> - Click any of the **Demo Profile** buttons to auto-populate the Name, USN, and DOB fields with 1 click, enter the 5-character visual CAPTCHA, and sign in!
> - Alternatively, use the **"Role"** selector dropdown in the navbar for immediate live session switching.

---

## 📋 Implemented Core Modules (Synopsis Section 5.3)

- [x] **User Authentication Module**: Student registration & login with Name, USN, Date of Birth (DOB), dynamic visual SVG CAPTCHA verification, bcrypt credential hashing, and JWT session handling.
- [x] **Book Listing Module**: Academic textbook listing with genre, subject, course code, condition, and handover advice.
- [x] **Claim and Ownership Module**: Real-time validation preventing self-claims, atomic ownership transfers, condition inspection logging.
- [x] **Book Journey Module (The Hero Feature)**: Interactive visual timeline showing every owner, handover spot, and academic review.
- [x] **User Dashboard Module**: Aggregated metrics of books owned, listed, and passed forward down the chain with audit log table.

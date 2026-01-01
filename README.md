# SkipQ – Digital College Canteen Management System

**SkipQ** is a campus-focused digital canteen platform designed to reduce physical queues and improve service efficiency in college dining environments. The system enables remote ordering, digital payments, and real-time order tracking, allowing students to collect food only when it is ready.

---

## Abstract

College canteens often experience heavy congestion during peak hours due to manual ordering processes and cash-based transactions. These limitations lead to long queues, reduced service speed, and an overall poor dining experience.

SkipQ addresses these challenges by separating order placement from physical presence at the counter. By providing real-time order status updates and a structured token-based collection system, the platform improves throughput while minimizing crowding.

---

## Problem Statement

- Long physical queues during short break periods  
- Slow manual payment processes  
- Lack of visibility into order preparation status  
- Inefficient handling of peak-hour demand  

---

## Solution Overview

SkipQ digitizes the canteen workflow through a centralized web-based system:

1. Students place food orders remotely through the application  
2. Payments are completed digitally, removing cash handling delays  
3. Each order receives a unique token and QR code for verification  
4. Staff manage preparation and update order status in real time  

This approach reduces congestion and improves coordination between students and staff.

## View website

https://skipq-5e224.web.app/

---

## Core Features

### Student Interface
- Remote menu browsing and ordering  
- Real-time order status tracking  
- Unique token and QR-based order validation  
- Automatic token expiry to prevent misuse  

### Staff Dashboard
- Live order queue management  
- Simple status updates for each order  
- Menu availability control  

### Analytics & Insights
- Peak-time usage analysis  
- Basic support for demand forecasting  
- Insights to help reduce food wastage  

---

## Comparison with Existing Systems

| Feature / Aspect            | SkipQ | Generic Food Apps | Traditional Token Systems |
|----------------------------|:-----:|:-----------------:|:-------------------------:|
| Campus-focused design      | Yes | No | No |
| Remote ordering            | Yes | Yes | No |
| Token with QR verification | Yes | No | No |
| Real-time order tracking   | Yes | Limited | No |
| Analytics readiness        | Yes | No | No |

---

## Technology Stack

| Component | Technology |
|----------|------------|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Analytics | Google Gemini (AI-ready) |
| Icons | Lucide React |

---

## Security & Access Control

- Role-based access for students and staff  
- Login restricted to institutional email domains  
- Secure data access enforced using Firestore rules  

---

## Installation & Local Setup

### Prerequisites
- Node.js (v18 or later)  
- Firebase project with Authentication and Firestore enabled  

### Steps

1. Clone the repository  
  
   ```bash
   git clone https://github.com/username/skipq.git
   cd skipq
   ````

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables
   Create a `.env` file in the project root:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. Run the development server

   ```bash
   npm run dev
   ```

---

## Conclusion

SkipQ provides a simple and effective solution for managing college canteen operations. By enabling remote ordering, digital payments, and real-time coordination, the platform improves both student convenience and canteen efficiency.

**SkipQ – Let students eat, not wait.**



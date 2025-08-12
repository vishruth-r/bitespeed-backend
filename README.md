# Bitespeed Backend Identity Reconciliation Service

This repository contains the backend service for Bitespeed's identity reconciliation system. The service is built with Node.js, Express, TypeScript, and PostgreSQL database hosted on Supabase.

## Overview

The Identity Reconciliation Service is designed to track and manage customer identity information across multiple touchpoints. It helps businesses identify and consolidate customer records when the same customer uses different contact methods (email or phone number) across interactions.

## Features

- Identity resolution based on email and phone number
- Automated contact linking with primary/secondary relationship management
- RESTful API for contact identification
- Health check endpoint for monitoring
- Integration with PostgreSQL database hosted on Supabase for data persistence

## Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **TypeScript**: Programming language
- **PostgreSQL**: Database engine
- **Supabase**: PostgreSQL database hosting and authentication
- **dotenv**: Environment management

## Project Structure

```
bitespeed-backend/
├── src/
│   ├── config/
│   │   └── server.ts
│   ├── controllers/
│   │   ├── contactController.ts
│   │   └── identityController.ts
│   ├── db/
│   │   └── supabase.ts
│   ├── models/
│   │   └── contact.ts
│   ├── routes/
│   │   ├── contactRoutes.ts
│   │   ├── identityRoutes.ts
│   │   └── healthRoutes.ts
│   ├── services/
│   │   └── contactService.ts
│   ├── utils/
│   │   └── dbMapper.ts
│   └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vishruth-r/bitespeed-backend.git
cd bitespeed-backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 4. Database Setup

The application uses PostgreSQL database hosted on Supabase. Make sure you have created a PostgreSQL table named `contact` in your Supabase project with the following structure:

```sql
CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  phonenumber VARCHAR(15),
  email VARCHAR(255),
  linkedid INTEGER,
  linkprecedence VARCHAR(20) NOT NULL,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedat TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_contact_email ON contact(email);
CREATE INDEX idx_contact_phone ON contact(phonenumber);
CREATE INDEX idx_contact_linkedid ON contact(linkedid);
```

### 5. Run the application

For development:

```bash
npm run dev
# or
yarn dev
```

For production:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Documentation

### Identify Contact API

**Endpoint:** `POST /api/identify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```
Both fields are optional, but at least one must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": []
  }
}
```

### Health Check API

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2025-08-12T12:34:56.789Z"
}
```

## Business Logic

The service implements the following business logic for contact identification:

1. When a request is received with an email and/or phone number:
   - The system searches for existing contacts with the provided email or phone number.
   
2. If no contacts exist:
   - A new primary contact is created with the provided information.

3. If one or more contacts exist:
   - The system consolidates the information under a single primary contact.
   - If multiple primary contacts are found, the oldest one is kept as primary and others are converted to secondary.
   - Secondary contacts are linked to the primary contact through the `linkedId` field.

4. The response includes:
   - The primary contact ID
   - All unique emails associated with the contact
   - All unique phone numbers associated with the contact
   - IDs of all secondary contacts linked to the primary contact

## Error Handling

The service implements proper error handling for:
- Invalid request parameters
- Database errors
- Internal server errors

## Development

### Adding New Features

1. Create appropriate models in `src/models/`
2. Add service logic in `src/services/`
3. Create controllers in `src/controllers/`
4. Add routes in `src/routes/`
5. Import and register routes in `src/index.ts`

### Code Style

The codebase follows TypeScript best practices with:
- Strong typing
- Separation of concerns
- Service-oriented architecture

## Deployment

The application can be deployed to any Node.js hosting platform:

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the application:
```bash
npm start
```

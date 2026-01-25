# Security Model

This document outlines the security architecture and data protections for JobFit.

## Authentication & Authorization

JobFit uses a multi-tier security model to protect user data and ensure authorized access.

### 1. Invite-Only Access (Whitelisting)
Access to the application is controlled via an invite-only system. Users must provide a valid invite code which is validated server-side via Supabase RPC. Redemptions are tracked to prevent abuse.

### 2. Role-Based Access Control (RBAC)
Permissions are enforced via Supabase profiles:
- **Regular Users**: Can manage their own resume blocks, analyze jobs, and generate cover letters.
- **Testers**: Early access to new features and experimental Gemini models.
- **Admins**: Access to system health metrics and invite code management.

## Data Protections

### Client-Side Security (Secure Storage)
Since JobFit allows users to provide their own Gemini API keys (BYOK), we prioritize the protection of these credentials:
- **Encryption**: API keys are never stored in plain text. They are encrypted using **AES-GCM (256-bit)** via the Web Crypto API before being saved to `localStorage`.
- **Isolation**: Each device generates a unique encryption key, preventing simple copy-pasting of local storage data between devices.

### Database Security (Supabase RLS)
Security is enforced at the database level using Row Level Security (RLS) policies:
- **Isolation**: Users can only read and write their own profile data and resume blocks.
- **Edge Functions**: Sensitive operations like web scraping and invite redemption are handled in isolated server-side environments (Supabase Edge Functions).
- **Environment Isolation**: System-level API keys for Gemini Pro and other services are stored in Supabase Vault and are never exposed to the client.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please open a GitHub Issue or contact the maintainer directly. Data privacy and security are our top priorities.

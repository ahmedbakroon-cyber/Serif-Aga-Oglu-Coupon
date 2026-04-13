# Cafe QR Coupon System

## Overview

A full-stack web app for cafe owners to create, print, and manage QR-based discount coupons. Built with a pnpm monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **QR Code**: qrcode.react (generation), html5-qrcode (scanning)

## Features

- **Admin Dashboard**: Summary stats (batches, coupons, redemption rate), recent activity feed
- **Batch Creation**: Create coupon batches with quantity, discount type (percentage/fixed/free item), visual design (background color, logo, footer), language (EN/TR), expiry date
- **Print Layout**: A4-optimized grid layout (4x5) with dashed cut lines, cafe-style coupon cards with QR codes
- **Coupon Cards**: Compact business-card sized, auto-contrast text on custom backgrounds, subtle texture overlay
- **Coupon List**: Filterable by status (active/used/expired)
- **Public Coupon Page**: Mobile-friendly page shown when customer scans QR (does NOT redeem)
- **Staff Scanner**: Browser-based QR scanner + manual code entry for validation and redemption

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- **batches**: id, quantity, discount_type, discount_value, free_item_name, display_title, display_subtitle, language, background_color, logo_url, footer_text, expires_at, created_at
- **coupons**: id, batch_id, code (unique), discount_type, discount_value, free_item_name, display_title, display_subtitle, language, background_color, logo_url, footer_text, is_used, created_at, redeemed_at, expires_at

## API Endpoints

- `GET /api/batches` — list all batches with counts
- `POST /api/batches` — create a new batch with coupons
- `GET /api/batches/:batchId` — get batch details with coupons
- `GET /api/coupons` — list coupons with optional filters
- `GET /api/coupons/:code` — public coupon lookup
- `GET /api/coupons/:code/validate` — staff validation
- `POST /api/coupons/:code/redeem` — redeem a coupon
- `GET /api/dashboard/summary` — dashboard stats
- `GET /api/dashboard/recent-activity` — recent activity feed

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

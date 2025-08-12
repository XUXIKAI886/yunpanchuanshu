# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a lightweight cloud storage system (轻量级云盘项目) built with Next.js and Vercel Blob. It provides simple file sharing services where users can access independent file spaces through URLs without registration or login.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm run typecheck` - Run TypeScript type checking

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (configured in components.json)
- **Icons**: Lucide React
- **File Storage**: Cloudflare R2 (AWS S3 compatible)
- **Deployment**: Can be deployed as web app or integrated into Tauri desktop apps

## Architecture Overview

### File Storage Strategy
- Files are organized by space: `spaces/{spaceId}/{filename}`
- Each spaceId creates an isolated file namespace
- Files auto-expire after 24 hours from upload time
- File deduplication through unique filename generation

### Core Services
- `BlobService` (src/lib/blob.ts): Manages all Vercel Blob operations including upload, list, delete, and cleanup
- Automatic expired file cleanup functionality
- Space isolation with independent statistics per spaceId

### API Routes
- `POST /api/upload` - File upload (60s timeout, 10MB limit)
- `GET /api/files` - List files in space (45s timeout)  
- `DELETE /api/delete` - Delete specific file (30s timeout)
- `POST /api/cleanup` - Clean expired files (60s timeout)

### File Type Restrictions
The upload API enforces a whitelist of allowed file types including:
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word, Excel, PowerPoint
- Archives: ZIP, RAR, 7Z
- Media: MP4, AVI, MOV, MP3, WAV, FLAC
- Text: Plain text, CSV

### UI Components Architecture
- **FileUploader**: Handles drag-and-drop and file selection
- **FileList**: Displays files with search, sort, and actions
- **FileItem**: Individual file display with download/delete
- **SpaceInfo**: Shows space statistics and usage
- **CountdownTimer**: Shows file expiration countdown

### State Management
- `useFileUpload` hook: Manages upload progress and status
- `useFileList` hook: Manages file list data and operations
- React state for UI interactions, no external state management

### Key Features
- 24-hour automatic file expiration and cleanup
- Real-time upload progress tracking
- File search and sorting capabilities
- Responsive design for desktop/tablet/mobile
- Automatic file renaming for duplicates
- Space usage statistics
- Compatible with Tauri webview integration

## Important Files
- `src/lib/r2.ts` - Cloudflare R2 storage operations
- `src/lib/blob.ts` - Storage service wrapper for backward compatibility
- `src/lib/types.ts` - TypeScript type definitions
- `src/app/space/[spaceId]/page.tsx` - Main file space interface
- `src/components/FileItem.tsx` - File item component with download logic
- `next.config.js` - Next.js configuration
- Environment variables: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

## Testing
No test framework is currently configured. When adding tests, check the existing codebase structure and add appropriate test configuration.

## Localization
The application is in Chinese (zh locale) with Chinese error messages and UI text throughout the codebase.
# GitHub Copilot Instructions for JobFit

## Project Overview
JobFit is a minimalist, AI-powered job compatibility analysis tool that helps users:
- Analyze job compatibility with a 0-100% fit score
- Manage resume content as modular, reusable "blocks"
- Generate tailored cover letters and resume suggestions
- Track job applications with detailed analysis and history

## Technology Stack
- **Frontend**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: CSS with theme support (light/dark mode)
- **AI Integration**: Google Gemini API
- **Backend**: Supabase (database, authentication, edge functions)
- **Testing**: Vitest with Testing Library
- **Analytics**: Vercel Analytics (privacy-first)

## Project Structure
```
/src
  /components       - React components (ResumeEditor, JobFitPro, AdminDashboard, etc.)
  /contexts        - React contexts (UserContext, ToastContext, ThemeContext)
  /hooks           - Custom React hooks (useLocalStorage, etc.)
  /services        - Business logic (geminiService, storageService, scraperService)
  /prompts         - AI prompt templates (analysis.ts, parsing.ts)
  /utils           - Utility functions (secureStorage, encryption)
  /test            - Test utilities and setup
  App.tsx          - Main application component
  types.ts         - TypeScript type definitions
  constants.ts     - Application constants
```

## Key Features & Architecture

### 1. Resume Block System
- Users create modular resume "blocks" (Work Experience, Projects, Skills)
- Each block is a discrete, reusable piece of content
- AI suggests which blocks to include/exclude for specific jobs
- Stored in Supabase with RLS (Row Level Security)

### 2. Job Analysis Engine
- Accepts job descriptions via URL (scraped via Supabase Edge Function) or paste
- Uses Google Gemini API to analyze compatibility
- Generates:
  - Fit score (0-100%)
  - Gap analysis (strengths vs. missing skills)
  - Tailored recommendations
  - Custom cover letters

### 3. Storage Architecture
- **Dual Mode**: Supports both Supabase (managed) and Local Storage (BYOK - Bring Your Own Key)
- **Encryption**: All sensitive data encrypted using AES-GCM
- **Privacy First**: No tracking, no analytics beyond Vercel's privacy-preserving stats

### 4. Authentication & Authorization
- Invite-only system (requires invite codes)
- Supabase Auth with email verification
- Role-Based Access Control (RBAC):
  - `user` - Standard users with access to their own data
  - `admin` - Administrative access to manage users and system

### 5. Skills & Interview Preparation
- Custom skills tracking with proficiency levels
- AI-generated interview questions based on skill gaps
- Practice mode for interview preparation

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use explicit types, avoid `any`
- Define interfaces in `types.ts` for shared types
- Use Zod for runtime validation where needed

### React Patterns
- Functional components with hooks
- Use contexts for global state (User, Toast, Theme)
- Custom hooks for reusable logic (`useLocalStorage`, etc.)
- Error boundaries for graceful error handling

### Styling
- CSS modules or inline styles with CSS-in-JS patterns
- Theme-aware components using CSS variables
- Dark mode support via `data-theme` attribute

### API Integration
- Gemini API calls in `geminiService.ts`
- Supabase operations in `storageService.ts`
- Edge functions for web scraping and external operations

### Security Best Practices
- API keys stored encrypted in browser
- Row Level Security (RLS) on all Supabase tables
- Input sanitization and validation
- No sensitive data in logs or analytics

## Testing
- Unit tests using Vitest
- Component tests with Testing Library
- Run tests: `npm test`
- Coverage: `npm run test:coverage`

## Common Tasks

### Adding a New Feature
1. Define types in `types.ts` if needed
2. Create service functions in `/services` for business logic
3. Build UI components in `/components`
4. Add tests in appropriate test files
5. Update documentation if user-facing

### Working with AI Prompts
- Prompt templates in `/src/prompts/`
- `analysis.ts` - Job fit analysis prompts
- `parsing.ts` - Resume parsing prompts
- Follow existing patterns for prompt engineering

### Database Operations
- Schema defined in `/supabase_schema.sql`
- Use `storageService.ts` for all database operations
- Ensure RLS policies are respected
- Test with both authenticated and unauthenticated states

### Adding New Dependencies
- Run security check: `npm audit`
- Keep bundle size minimal
- Prefer tree-shakeable libraries
- Update package.json with exact versions

## Environment Variables
```
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
```

## Build & Deploy
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

## Key Files to Reference
- `/src/types.ts` - All TypeScript interfaces and types
- `/src/constants.ts` - Application constants and configuration
- `/src/services/geminiService.ts` - AI integration logic
- `/src/services/storageService.ts` - Data persistence layer
- `/supabase_schema.sql` - Database schema and RLS policies
- `/SECURITY.md` - Security model and best practices
- `/CHANGELOG.md` - Recent changes and technical decisions

## Context for Feature Suggestions
When suggesting improvements or new features, consider:
- **Privacy**: Users value privacy; avoid tracking or analytics
- **Modularity**: Maintain the "block" system for resume content
- **AI-First**: Leverage Gemini API for intelligent features
- **Minimalist UX**: Keep the interface clean and focused
- **Security**: Follow encryption and RLS patterns
- **Accessibility**: Ensure features work for all users
- **Performance**: Keep bundle size small, optimize for speed

## Current Feature Set
1. **Job Analysis**: URL scraping, fit scoring, gap analysis
2. **Resume Blocks**: Modular work experience, projects, and skills management
3. **Cover Letters**: AI-generated, tailored content
4. **History**: Track all analyzed jobs with full history
5. **Skills Tracking**: Custom skills with proficiency levels and interview prep
6. **Theme Support**: Light/dark mode with smooth transitions
7. **Admin Panel**: User management, invite codes, system monitoring
8. **Local Storage Mode**: BYOK for complete data control

## Known Patterns & Idioms
- Use `useUser()` hook to access current user and auth state
- Use `useToast()` for user notifications
- Wrap async operations in try-catch with proper error handling
- Use `Storage` class from `storageService.ts` for all data operations
- Follow the service pattern: UI → Service → API/Database

## Questions to Ask When Making Changes
1. Does this maintain user privacy?
2. Is this secure (encryption, RLS, validation)?
3. Does this work in both storage modes (Supabase & Local)?
4. Is this accessible and responsive?
5. Does this add unnecessary dependencies or bundle size?
6. Are there tests covering this change?
7. Does this follow existing patterns in the codebase?

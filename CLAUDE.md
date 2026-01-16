# LifeOS - Project-Specific Claude Instructions

## Project Overview
Personal productivity dashboard built with Next.js/TypeScript and PostgreSQL.
**Production Name**: `dashboard` (on `foster-core`)
**Development Name**: `lifeos` (on `foster-forge`)

## Memory Hierarchy
1. First check `./docs/notes/` (LifeOS-specific)
2. Then check `~/homelab/notes/` (infrastructure)
3. Reference `~/homelab/reference/` (server specs)

## Development Workflow
- **Development**: Work on `foster-forge` in `~/projects/lifeos`
- **Testing**: Run `npm run test` before commits
- **Database migrations**: Use Prisma, document in decisions.md
- **Styling**: Tailwind utility classes only (no custom CSS)
- **Deployment**: Push to git, pull on `foster-core` (`~/projects/dashboard`), rebuild

## Quality Standards
- TypeScript strict mode enabled
- All functions must have JSDoc comments
- Error boundaries for all async operations
- Mobile-responsive by default

## When to Update Memory
- New features → `issues.md`
- Bug fixes → `bugs.md` (if recurring or instructive)
- Technology choices → `decisions.md`
- API endpoints / env vars → `key_facts.md`

## Project Specific Gotchas
- **TypeScript Null Handling:** Prisma returns `null` for nullable fields, but TypeScript often expects `undefined`. Use `field || undefined` to convert.

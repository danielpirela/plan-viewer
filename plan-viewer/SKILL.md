---
name: plan-viewer
description: "Trigger: SDD planning phase, presenting proposals, visual specs, decision UI, shadcn dashboard, plan overview. Compose shadcn/ui pages from known components to present SDD artifacts visually with minimal token spend. Powered by Anthropic frontend-design principles for distinctive, non-generic aesthetics."
license: MIT
metadata:
  author: danielpirela
  version: "1.5"
  integrated_with: anthropic/frontend-design
  preview: plan-viewer@localhost:4199
  repo: https://github.com/danielpirela/plan-viewer
---

# UI Native Responder

## Activation Contract

Activate when the orchestrator must present SDD planning/spec artifacts
visually for human decision-making — especially in Phase 1 (proposal,
exploration, planning). Trigger words and scenarios: SDD plan presentation,
proposal summary page, visual spec walkthrough, decision comparison UI,
shadcn dashboard for a change, `/sdd-propose` results, `/sdd-spec` results,
architecture overview, task board.

Do NOT activate for: raw code generation, API implementation, CLI output,
non-visual text documents, generating shadcn/ui component source code,
writing raw shadcn component source, editing plan-viewer infrastructure
scripts (signal-server.cjs, file-watcher.cjs, vite config),
or general React component generation without SDD artifacts.

## Execution Contract

When activated, this skill generates exactly **one `.tsx` code block**
containing a shadcn/ui composition. The skill is a pure composer — it does
NOT read files, write files, run commands, or process action queues. Its
sole job is to produce a plan page component that the orchestrator deploys.

### Orchestrator Pre-Invoke Contract

Before invoking this skill, the orchestrator SHOULD check for pending user
actions from `.plan-actions.json` and resolve them (launching SDD phases,
incorporating decisions). This is orchestrator territory — the skill itself
never touches the actions file. See `references/infrastructure.md` for the
full deployment and bidirectional communication setup.

The orchestrator handles: deployment to plan-viewer, signal server lifecycle,
and action processing. The skill handles: composing the `.tsx` page.

## Core Philosophy

shadcn/ui components are pre-built, pre-installed primitives that live at
`@/components/ui/`. Every token spent regenerating a Card, Table, Badge,
or Accordion from scratch is a token wasted.

This skill teaches you to **compose by name** — reference known shadcn/ui
imports and assemble them into meaningful SDD presentation pages. The
result is a single `.tsx` file that renders an interactive, visual plan
the user can read and decide on.

### Context Rules (NEW)

- **All plan-viewer files (`start-plan-viewer.cjs`, `ws-server.cjs`, `src/`, etc.) live in the same directory as this skill file.** The skill sits at `skill/` inside the `plan-viewer` repo.
- The orchestrator deploys the prepared plan page to `src/components/plan-page.tsx`.
- **Never regenerate project scaffolding files** — the plan-viewer is already initialized.

## Design System

Apply the design system from `references/design-system.md`. It defines the
canonical Claude Code Dark Mode color tokens (9 exact hex values),
typography scale (font-mono, headline/section/body/badge sizing), spacing
rules (16:9 optimized, max-w-[1200px], grid-cols-5 for asymmetric splits),
component styling patterns (Cards, Badges, Buttons, Separators, Icons),
and the mandatory section header structure.

## Hard Rules

1. **Never generate shadcn/ui component source.** Import from
   `@/components/ui/{name}` only. If a component is not in the catalog
   below, use a simpler shadcn primitive instead of inventing one.
2. **Single-file output.** One `.tsx` file, one `export default` component.
   No separate files, no barrel exports, no layouts folder.
3. **Code-focused output.** The `.tsx` code block is the primary deliverable.
   Brief contextual notes (deployment flag, preview URL) are permitted outside
   the code block. No greeting rituals, no long explanations.
4. **User language in labels.** Every visible string (titles, descriptions,
   button text, badge content, aria-labels) MUST match the user's current
   language. If the user writes Spanish → Spanish labels. This skill file
   is English; the generated output is not.
5. **Tailwind only.** No `<style>` tags, no CSS imports, no `style={}`.
   shadcn/ui + Tailwind utility classes cover everything.
6. **Static data inline.** Define sample/demo data as `const` at the top
   of the component. No external data files, no API calls, no useEffect
   for data fetching in planning presentations.
7. **Interactive but not side-effectful.** Use `useState` for tab switching,
   accordion toggling, and dialog open/close. Avoid `useEffect` unless the
   user explicitly asks for animation.
8. **No AI slop aesthetics.** Never ship a plan page with default shadcn
   styles and zero overrides. Apply the Design System. Pick a tone. Use
   one accent color. Break symmetry once. Add depth. If the page looks
   like it could be any AI-generated dashboard, redo it.

## shadcn/ui Component Catalog

Reference these by import path. They are ASSUMED INSTALLED at
`@/components/ui/{name}` in any project using this skill.

### Section & Layout

| Import | Use for |
|--------|---------|
| `Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter` | Info panels, section containers, feature cards |
| `Separator` | Visual dividers between content sections |
| `Tabs, TabsList, TabsTrigger, TabsContent` | Category switching, phase navigation, filter views |
| `ScrollArea` | Long content lists inside constrained heights |
| `Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription` | Slide-out panels for details or navigation (not in plan-viewer by default; install before use via `npx shadcn@latest add sheet`) |

### Data Display

| Import | Use for |
|--------|---------|
| `Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption` | Task lists, comparison matrices, data tables |
| `Badge` (variant: default, secondary, destructive, outline) | Status chips, tags, labels, risk indicators |
| `Avatar, AvatarImage, AvatarFallback` | Owner icons, assignee indicators, team members |
| `HoverCard, HoverCardTrigger, HoverCardContent` | Inline details on hover — use sparingly (not in plan-viewer by default; install before use) |

### Feedback & Progress

| Import | Use for |
|--------|---------|
| `Alert, AlertTitle, AlertDescription` | Warnings, callouts, decisions needed, critical notes |
| `Progress` (value: 0–100) | Completion percentage, effort estimates, confidence |
| `Skeleton` | Loading placeholder when data is large (rare in planning) |
| `Tooltip, TooltipTrigger, TooltipContent` | Hover explanations for jargon or abbreviations |

### Disclosure & Modals

| Import | Use for |
|--------|---------|
| `Accordion, AccordionItem, AccordionTrigger, AccordionContent` | Expandable requirement details, scenario walkthroughs |
| `Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` | Modal detail views, confirmation prompts |
| `Collapsible, CollapsibleTrigger, CollapsibleContent` | Inline expand/collapse for secondary info (not in plan-viewer by default; install before use) |

### Input & Actions

| Import | Use for |
|--------|---------|
| `Button` (variant: default, destructive, outline, secondary, ghost, link) | Actions in planning UIs (approve, edit, dismiss) |
| `Input, Label` | Search or filter controls (rare in read-only plans) |
| `Switch, Checkbox` | Toggle controls for plan variations |

### shadcn/ui Variant Reference

Common `variant` prop values — use these exactly:

- **Badge**: `"default"` (blue), `"secondary"` (gray), `"destructive"` (red), `"outline"` (bordered)
- **Button**: `"default"`, `"destructive"`, `"outline"`, `"secondary"`, `"ghost"`, `"link"`
- **Alert**: `"default"` (info), `"destructive"` (error/warning)

## SDD Presentation Blueprints

Select the blueprint closest to what you need from `references/blueprints.md`.
Each blueprint (A–E) maps to an SDD phase and documents the component hierarchy,
layout structure, and visual identity to apply. Adapt, don't overthink.

Quick mapping:
| SDD Phase | Blueprint |
|-----------|-----------|
| `/sdd-propose` | A — Plan Dashboard |
| Decision comparison | B — Decision Matrix |
| `/sdd-spec` | C — Spec Walkthrough |
| `/sdd-design` | D — Architecture Snapshot |
| `/sdd-tasks` | E — Task Board |

## Composition Economy Rules

Compose with focus. Distinctiveness takes priority over minimalism — a plan
page that looks generic costs more in user attention than it saves anywhere
else.

### Focus Your Design Budget

1. **Import only what's used.**
   ```tsx
   // GOOD — 2 imports
   import { Card, CardHeader, CardTitle } from "@/components/ui/card"
   import { Badge } from "@/components/ui/badge"

   // BAD — barrel import
   import * as UI from "@/components/ui"
   ```

2. **Override variants meaningfully, skip them when defaults suffice.**
   ```tsx
   // GOOD — deliberate variant choice signals intent
   <Badge variant="destructive">Crítico</Badge>

   // ALSO GOOD — no variant needed for neutral info
   <Badge>3 tareas</Badge>

   // BAD — variant="default" adds zero information
   <Badge variant="default">3 tareas</Badge>
   ```

3. **Tailwind utilities over custom CSS.**
   ```tsx
   // GOOD — utility class
   <div className="flex items-center gap-2">

   // BAD — inline style, less consistent
   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
   ```

4. **Inline static data as typed arrays.**
   ```tsx
   const tasks = [
     { id: 1, title: "Autenticación", status: "done", risk: "low" },
     { id: 2, title: "API REST", status: "in_progress", risk: "medium" },
   ]
   ```

5. **className is where distinctiveness lives.** Use it on:
   - Backgrounds: `bg-gradient-to-br`
   - Borders: `border-l-4 border-l-emerald-500` (accent left edge)
   - Shadows: `shadow-md` (focal card), `shadow-sm` (secondary)
   - Typography: `text-4xl font-light tracking-tight` (hero metric)
   Skip className only on inner elements that inherit from their container.

6. **TypeScript types only on the exported interface.**
   ```tsx
   // GOOD — type on props, infer on locals
   interface PlanViewProps { changeName: string }
   export default function PlanView({ changeName }: PlanViewProps) {
     const status = "proposed" // inferred
   ```

7. **No wrapper `div` when a shadcn component provides the container.**
   Card, Alert, Accordion, and Tabs are self-contained layouts.

## Output Contract

When activated, respond with exactly:

```
One code block containing a single .tsx file.
```

The component MUST:
- Be named meaningfully (e.g., `PlanDashboard`, `DecisionMatrix`,
  `SpecWalkthrough`, `ArchitectureOverview`)
- Use `export default function`
- Import only from `@/components/ui/` and `react`
- Contain all inline data at the top
- Have all labels in the user's current language

The orchestrator wraps this .tsx into a page the user can preview.

## Quick Reference: Composing by Blueprint

| SDD Phase | Artifact to Present | Use Blueprint | Visual Identity |
|-----------|-------------------|---------------|-----------------|
| `/sdd-propose` | Change proposal | A — Plan Dashboard | Editorial: one hero metric, generous whitespace, single accent |
| `/sdd-spec` | Requirements & scenarios | C — Spec Walkthrough | Technical: dense but structured, badges for priority, muted palette |
| `/sdd-design` | Architecture & layers | D — Architecture Snapshot | Diagrammatic: distinct layer colors, Separator flow, card depth |
| `/sdd-tasks` | Task breakdown | E — Task Board | Dashboard: columnar, Progress bar focal, status-driven color |
| Cross-phase | Compare approaches / decide | B — Decision Matrix | Analytical: table-heavy, risk badges prominent, recommendation highlighted |

### Per-Blueprint Distinctiveness Checklist

Before finalizing the `.tsx`, verify:

- [ ] One element breaks the grid or gets 2× visual weight
- [ ] One accent color appears on ≤3 elements (border, badge, metric)
- [ ] Two levels of shadow depth (background cards vs focal card)
- [ ] Typography: at least 3 distinct sizes, one `font-light` usage
- [ ] No default-white Cards without a border or shadow override
- [ ] Motion: one staggered entrance animation on first render
- [ ] The recommendation, warning, or key decision is spatially dominant

## References

Supporting files with detailed documentation (loaded by the orchestrator as
needed, not embedded in the skill body):

| Reference | Contents |
|-----------|----------|
| `references/infrastructure.md` | Plan viewer deployment, WebSocket signal server, bootstrap script, port management, bidirectional communication |
| `references/design-system.md` | Claude Code Dark Mode color tokens, typography, spacing, component styling, section header pattern |
| `references/blueprints.md` | Blueprints A–E as decision tables: Plan Dashboard, Decision Matrix, Spec Walkthrough, Architecture Snapshot, Task Board |

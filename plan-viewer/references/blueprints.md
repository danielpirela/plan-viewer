# SDD Presentation Blueprints

Pick the blueprint closest to what you need. Adapt, don't overthink.

Each blueprint maps to an SDD phase. The tables below describe the component
hierarchy, layout structure, and visual identity to apply.

## Blueprint A — Plan Dashboard

**Use for**: `/sdd-propose` results, change overview, project status.

| Section | Components | Notes |
|---------|------------|-------|
| Header | `Card` → `CardHeader` | `CardTitle`: change name, `CardDescription`: one-line summary, `Badge` (right): status/confidence |
| Progress | `Progress` | Overall completion percentage |
| Info grid | `grid grid-cols-3 gap-4` | 3× `Card`: Scope (Badge list), Risks (Badge list), Decisions (Alert) |
| Divider | `Separator` | Between grid and task list |
| Tasks | `Table` | Rows with task name, status `Badge`, effort |
| Footer | `CardFooter` (optional) | Action `Button`(s) |

**Visual Identity**: Editorial — one hero metric, generous whitespace, single accent.

## Blueprint B — Decision Matrix

**Use for**: comparing approaches, technology choices, architecture decisions.

| Section | Components | Notes |
|---------|------------|-------|
| Header | `CardHeader` → `CardTitle` | "Decisión: {topic}" |
| Matrix | `Table` | Columns: Opción, Pros, Contras, Esfuerzo, Riesgo |
| Risk badges | `Badge` per row | Low → `outline`, Medium → `secondary`, High → `destructive` |
| Footer | `CardFooter` → `Alert variant="default"` | Recommendation summary |

**Risk badge mapping**: Low risk → `variant="outline"`, Medium risk → `variant="secondary"`, High risk → `variant="destructive"`.

**Visual Identity**: Analytical — table-heavy, risk badges prominent, recommendation highlighted.

## Blueprint C — Spec Walkthrough

**Use for**: `/sdd-spec` results, requirements review, scenario browsing.

| Section | Components | Notes |
|---------|------------|-------|
| Category nav | `Tabs` → `TabsList` | One `TabsTrigger` per requirement category |
| Per-category content | `TabsContent` | One per tab |
| Requirement list | `Accordion` | One `AccordionItem` per requirement |
| Item trigger | `AccordionTrigger` + `Badge` | Requirement title + priority badge |
| Item content | `AccordionContent` | `Card`(s) per scenario, `Alert` for edge cases |

**Visual Identity**: Technical — dense but structured, badges for priority, muted palette.

## Blueprint D — Architecture Snapshot

**Use for**: `/sdd-design` results, component diagrams, layer overview.

| Section | Components | Notes |
|---------|------------|-------|
| Layout | `grid grid-cols-1 md:grid-cols-3 gap-4` | Three-layer horizontal split |
| Layer: Presentation | `Card` + Badge `outline` | `CardHeader` title, `CardContent` component list |
| Layer: Domain | `Card` + Badge `secondary` | Services, entities |
| Layer: Infrastructure | `Card` + Badge `default` | DB, APIs, external services |
| Divider | `Separator` | Between rows |
| Data flow | `Badge` "→" | Between cards showing direction |

**Layer badge mapping**: Presentation/UI → `outline`, Domain/Business Logic → `secondary`, Infrastructure/Data → `default`.

**Visual Identity**: Diagrammatic — distinct layer colors, Separator flow, card depth.

## Blueprint E — Task Board

**Use for**: `/sdd-tasks` results, implementation tracking.

| Section | Components | Notes |
|---------|------------|-------|
| Stats bar | `Progress` + completion stats | Top of page |
| Column layout | `grid grid-cols-1 md:grid-cols-3 gap-4` | Three status columns |
| Column: Pending | `Card` + `Badge` | Small task cards with effort/type badges |
| Column: In Progress | `Card` + `Badge` | Same structure |
| Column: Completed | `Card` + `Badge` | Same structure |

**Visual Identity**: Dashboard — columnar, Progress bar focal, status-driven color.

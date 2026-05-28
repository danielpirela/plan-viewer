# Design System — Claude Code Dark Mode (Canonical)

The canonical visual identity for all SDD plan pages is the **Claude Code
Dark Mode** aesthetic. This is the established default. Do NOT switch to
Light Mode, Apple UI, or generic shadcn defaults unless the user
explicitly overrides.

## Color Tokens (STRICT — use these exact hex values)

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#11111b` | Page background |
| Card bg | `#181825` | Card/container surfaces |
| Border | `#313244` | All borders, dividers, separators |
| Text primary | `#cdd6f4` | Headlines, labels, body |
| Text muted | `#6c7086` | Descriptions, secondary info |
| Accent | `#89b4fa` | Hero numbers, badges, buttons, links |
| Success/Low | `#a6e3a1` | Low risk, in-scope, positive states |
| Warning/Medium | `#f9e2af` | Medium risk, attention |
| Danger/High | `#f38ba8` | High risk, destructive |

## Typography

- **Font**: `font-mono` (JetBrains Mono or system monospace). SDD plans
  are technical documents — monospace reinforces the engineering context.
- **Headlines**: `text-3xl md:text-4xl font-bold tracking-tight`
- **Section titles**: `text-sm font-bold uppercase tracking-wide`
- **Body**: `text-xs` or `text-sm` with `leading-relaxed`
- **Badges**: `text-[10px] font-mono uppercase`

## Spacing & Layout (Wide 16:9 Optimized)

- **Container**: `max-w-[1200px] mx-auto` — wide for horizontal presentation
- **Padding**: `p-6 md:p-10` page, `px-4 pb-4 pt-0` inside cards
- **Grid**: Use `grid-cols-5` for asymmetric layouts (3:2 or 2:3 splits)
- **Cards**: `rounded-xl` (12px), never `rounded-2xl` or fully rounded
- **No shadows**: Use `border border-[#313244]` for depth, never `shadow-*`

## Component Styling Rules

- **Cards**: `bg-[#181825] border-[#313244] rounded-xl shadow-none`
- **Badges**: `rounded bg-[#313244] text-[#89b4fa] border-0 text-[10px] font-mono`
  or risk-colored variants with `border` and transparent bg
- **Buttons**: `rounded-lg bg-[#89b4fa] text-[#11111b] font-mono font-bold text-xs`
- **Separators**: Always `border-[#313244]`, never default color
- **Icons**: Lucide icons, 16px (`w-4 h-4`) with color matching the section
  (e.g., `AlertTriangle` in `#f38ba8` for risks)

## Section Header Pattern

Every card MUST have this header structure:
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4 text-[#section-color]" />
  <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide">
    Section Name
  </CardTitle>
  <span className="text-xs text-[#6c7086] ml-auto">metadata count</span>
</div>
```

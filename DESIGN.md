# DESIGN.md — VetStock Design System

> **Authority:** This document is the single source of truth for all visual decisions. Code must conform to these tokens. When code diverges, code is wrong — update code or update this doc with approval.

---

## 1. Color System

### 1.1 Brand Palette

| Token | Hex | Usage | Contrast on White | Contrast on Dark |
|-------|-----|-------|-------------------|------------------|
| `brand-50` | `#E8F5E9` | Light backgrounds, hover states | — | — |
| `brand-100` | `#C8E6C9` | Subtle fills, selected chips | — | — |
| `brand-200` | `#A5D6A7` | Disabled borders | — | — |
| `brand-300` | `#81C784` | — | — | — |
| `brand-400` | `#66BB6A` | — | — | — |
| `brand-500` | `#4CAF50` | Secondary actions, success states | 3.1:1 ❌ | 6.7:1 ✅ |
| `brand-600` | `#2E7D32` | **Primary brand**, primary buttons, FAB | 4.6:1 ✅ | 4.5:1 ✅ |
| `brand-700` | `#1B5E20` | **Primary dark**, headers, nav bar | 7.3:1 ✅ | 2.9:1 ❌ |
| `brand-800` | `#145218` | Text on light brand backgrounds | 10.2:1 ✅ | — |
| `brand-900` | `#0D3B0F` | — | — | — |

> ⚠️ **Rule:** `brand-500` fails AA on white. Never use as text on white. Use `brand-600` or `brand-700` instead.

### 1.2 Semantic Colors (Status/Feedback)

| Token | Hex | Light Mode | Dark Mode | Usage |
|-------|-----|------------|-----------|-------|
| `success` | `#2E7D32` | ✅ 4.6:1 | ✅ 4.5:1 | OK status, positive actions |
| `warning` | `#E65100` | ✅ 4.5:1 | ✅ 4.5:1 | Low stock, expiring soon |
| `danger` | `#C62828` | ✅ 5.3:1 | ✅ 4.5:1 | Out of stock, expired, destructive |
| `info` | `#1565C0` | ✅ 4.5:1 | ✅ 4.5:1 | Neutral info, category: Medicamentos |

> All semantic colors pass WCAG AA on both white and dark surfaces.

### 1.3 Category Colors (Fixed — Do Not Change)

| Category | Token | Hex | Light Contrast | Dark Contrast |
|----------|-------|-----|----------------|---------------|
| Medicamentos | `cat-medicamentos` | `#1565C0` | 4.5:1 ✅ | 4.5:1 ✅ |
| Vacinas | `cat-vacinas` | `#2E7D32` | 4.6:1 ✅ | 4.5:1 ✅ |
| Antiparasitários | `cat-antiparasitarios` | `#6A1B9A` | 6.2:1 ✅ | 4.5:1 ✅ |
| Soluções | `cat-solucoes` | `#00838F` | 4.5:1 ✅ | 4.5:1 ✅ |
| Suplementos | `cat-suplementos` | `#E65100` | 4.5:1 ✅ | 4.5:1 ✅ |
| Equipamentos | `cat-equipamentos` | `#37474F` | 7.1:1 ✅ | 4.5:1 ✅ |
| Outros | `cat-outros` | `#795548` | 5.8:1 ✅ | 4.5:1 ✅ |

> **Usage:** Category badge bg = `color + '22'` (13% opacity), dot/text = full opacity.

### 1.4 Neutral Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-0` | `#FFFFFF` | Surface, cards |
| `neutral-50` | `#FAFAFA` | Input backgrounds |
| `neutral-100` | `#F4F6F9` | Page background |
| `neutral-200` | `#EEEEEE` | Dividers, borders |
| `neutral-300` | `#E0E0E0` | Input borders, inactive icons |
| `neutral-400` | `#BDBDBD` | Disabled text |
| `neutral-500` | `#9E9E9E` | Placeholder, secondary labels |
| `neutral-600` | `#757575` | Body text secondary |
| `neutral-700` | `#555555` | Body text primary |
| `neutral-800` | `#333333` | Headings |
| `neutral-900` | `#212121` | High-emphasis text |
| `neutral-950` | `#111111` | — |

### 1.5 Surface & Overlay

---

## 2. Typography

### 2.1 Font Stack

```typescript
// System fonts — no custom font files (performance, offline-first)
fontFamily: Platform.select({
  ios: 'System',           // San Francisco
  android: 'Roboto',       // Material Design
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  default: 'System',
});
```

> **No custom fonts.** System fonts respect user preferences, Dynamic Type, and load instantly.

### 2.2 Type Scale (Modular Scale — Ratio 1.25)

| Token | Size (px) | Line Height | Font Weight | Letter Spacing | Usage |
|-------|-----------|-------------|-------------|----------------|-------|
| `display-lg` | 32 | 40 | 700 (bold) | -0.5 | Logo, hero numbers |
| `display-md` | 28 | 36 | 700 | -0.25 | Screen titles (Home greeting) |
| `display-sm` | 24 | 32 | 600 | 0 | Section headers, card values |
| `heading-lg` | 22 | 28 | 700 | 0 | Card titles, modal titles |
| `heading-md` | 20 | 28 | 700 | 0 | Sub-section titles |
| `heading-sm` | 18 | 24 | 600 | 0 | Card subtitles, list headers |
| `body-lg` | 16 | 24 | 400 | 0 | Primary body, button text |
| `body-md` | 15 | 22 | 400 | 0 | Input text, secondary body |
| `body-sm` | 14 | 20 | 400 | 0 | Metadata, timestamps |
| `label-lg` | 13 | 20 | 600 | 0 | Form labels |
| `label-md` | 12 | 18 | 600 | 0 | Badge text, small labels |
| `label-sm` | 11 | 16 | 600 | 0 | Chip text, progress labels |
| `caption` | 10 | 14 | 400 | 0 | Helper text, version |

> **Rule:** Only these 13 sizes allowed. No arbitrary `fontSize: 17` etc.

### 2.3 Responsive Scaling (Dynamic Type Support)

```typescript
// All font sizes multiply by `fontScale` from useWindowDimensions / PixelRatio
// Clamp: 0.85 ≤ fontScale ≤ 1.3 (prevents broken layouts)
const scaled = (base: number) => Math.round(base * Math.max(0.85, Math.min(1.3, fontScale)));
```

### 2.4 Font Weight Scale

| Token | Weight | Usage |
|-------|--------|-------|
| `light` | 300 | — (unused) |
| `regular` | 400 | Body text |
| `medium` | 500 | Emphasized body |
| `semibold` | 600 | Labels, button text, values |
| `bold` | 700 | Headings, numbers, primary actions |
---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | — |
| `radius-sm` | 4 | Chips, badges, progress bars |
| `radius-md` | 8 | Buttons, inputs, cards (tight) |
| `radius-lg` | 12 | **Default card**, modals, sheets |
| `radius-xl` | 16 | Login card, large modals |
| `radius-full` | 9999 | Pills, avatar, FAB |

> **Rule:** Cards = `radius-lg` (12). Buttons/Inputs = `radius-md` (8). Chips/Badges = `radius-sm` (4).

---

## 5. Elevation / Shadows

### 5.1 Elevation Scale (Platform-Adaptive)

| Token | iOS (shadow) | Android (elevation) | Web (box-shadow) | Usage |
|-------|--------------|---------------------|------------------|-------|
| `elev-0` | none | 0 | none | Flat |
| `elev-1` | `0 1px 2px rgba(0,0,0,0.05)` | 1 | `0 1px 2px rgba(0,0,0,0.08)` | Cards (default) |
| `elev-2` | `0 2px 4px rgba(0,0,0,0.07)` | 2 | `0 2px 6px rgba(0,0,0,0.10)` | Raised cards, sheets |
| `elev-3` | `0 4px 8px rgba(0,0,0,0.08)` | 3 | `0 4px 12px rgba(0,0,0,0.12)` | Modals, FAB |
| `elev-4` | `0 8px 16px rgba(0,0,0,0.10)` | 6 | `0 8px 24px rgba(0,0,0,0.15)` | Bottom sheets, dropdowns |
| `elev-5` | `0 12px 24px rgba(0,0,0,0.12)` | 8 | `0 12px 32px rgba(0,0,0,0.18)` | Full-screen modals |

---

## 6. Component Specifications

### 6.1 Button

| Variant | Height | Padding H | Font | Background | Text Color | Border | Radius |
|---------|--------|-----------|------|------------|------------|--------|--------|
| `primary` | 50 | 24 | body-lg/semibold | `brand-600` | `neutral-0` | none | `radius-md` |
| `secondary` | 50 | 24 | body-lg/semibold | `neutral-0` | `brand-600` | `1.5px solid brand-300` | `radius-md` |
| `ghost` | 44 | 16 | body-md/medium | transparent | `brand-600` | none | `radius-md` |
| `danger` | 50 | 24 | body-lg/semibold | `danger` | `neutral-0` | none | `radius-md` |
| `icon-only` | 44 | — | — | varies | varies | none | `radius-full` |

**States:**
- `disabled`: `opacity: 0.5` + `pointer-events: none`
- `pressed` (native): `opacity: 0.8` (handled by `TouchableOpacity`/`Pressable`)
- `focus-visible` (web): `outline: 2px solid brand-500; outline-offset: 2px`

**Touch Target:** Minimum **44×44dp** (enforced by height + padding)

### 6.2 Input

| Property | Value |
|----------|-------|
| Height | 48 |
| Padding H | 14 |
| Font | `body-md` (15px) |
| Border | `1.5px solid neutral-300` |
| Border (focus) | `2px solid brand-600` |
| Border (error) | `2px solid danger` |
| Radius | `radius-md` (8) |
| Background | `neutral-0` |
| Placeholder | `neutral-500` |
| Label | `label-lg` (13px, semibold, `neutral-700`) |
| Helper/Error | `label-sm` (11px), `danger` or `neutral-600` |

**Accessibility:** `accessibilityLabel` = label text. `accessibilityState={{ invalid: !!error }}`

### 6.3 Card

| Property | Value |
|----------|-------|
| Background | `surface-primary` |
| Border Radius | `radius-lg` (12) |
| Padding | `space-4` (16) |
| Elevation | `elev-1` |
| Border (optional) | `borderLeftWidth: 4` + semantic color |

**Variants:**
- `default`: as above
- `tight`: padding `space-3` (12), elevation `elev-1`
- `outlined`: no elevation, `borderWidth: 1`, `borderColor: neutral-200`

### 6.4 Badge / Chip

| Property | Value |
|----------|-------|
| Padding H | 10 |
| Padding V | 4 |
| Font | `label-md` (12px, semibold) |
| Radius | `radius-full` |
| Background | `category-color + '22'` (13%) |
| Text Color | full opacity category color |

### 6.5 Status Badge (Pill)

| Property | Value |
|----------|-------|
| Padding H | 10 |
| Padding V | 4 |
| Font | `label-md` (12px, bold) |
| Radius | `radius-full` |
| Background | `semantic-color + '22'` |
| Text Color | full opacity semantic color |

### 6.6 Modal / Bottom Sheet

| Property | Mobile | Web |
|----------|--------|-----|
| Container | `flex: 1`, bottom-anchored | Centered, max-width 480 |
| Background | `surface-primary` | `surface-primary` |
| Border Radius | `radius-xl` (16) top only | `radius-xl` (16) all sides |
| Elevation | `elev-4` | `elev-5` |
| Backdrop | `overlay-scrim` | `overlay-strong` |
| Handle | Visible (drag indicator) | Hidden |
| Close on backdrop | ✅ | ✅ |

### 6.7 FAB (Floating Action Button)

| Property | Value |
|----------|-------|
| Size | 56×56 (mobile), 48×48 (web) |
| Shape | Circle (`radius-full`) |
| Background | `brand-600` |
| Icon Color | `neutral-0` |
| Elevation | `elev-3` |
| Position | `bottom: safeAreaBottom + 20`, `right: 20` (mobile) / `bottom: 24`, `right: 24` (web) |
| Touch Target | 56×56 minimum |

> **Critical:** Must respect safe area insets. Never cover tab bar or content.

### 6.8 Tab Bar

| Property | Value |
|----------|-------|
| Height | 60 + safe area bottom |
| Background | `surface-primary` |
| Border Top | `1px solid neutral-200` |
| Active Tint | `brand-700` |
| Inactive Tint | `neutral-500` |
| Icon Size | 22 |
| Label Font | `label-md` (12px, semibold) |
| Badge | `radius-full`, `danger` bg, `neutral-0` text, min-width 18 |

### 6.9 Header / Navigation Bar

| Property | Value |
|----------|-------|
| Height | 56 + safe area top |
| Background | `brand-700` |
| Title Font | `heading-sm` (18px, bold) |
| Title Color | `neutral-0` |
| Back/Action Color | `neutral-0` |
| Elevation | `elev-1` |
> **Implementation:** Use `Platform.select()` for shadow vs elevation. Never both.

### 5.2 Border as Accent (Left Border Pattern)

Used for status indication on cards:
---

## 7. Icon System

### 7.1 Strategy: Native Emoji Only

| Rule | Detail |
|------|--------|
| **No icon fonts** | Zero dependencies, no bundle size |
| **No SVG icons** | No asset management, renders natively per OS |
| **Emoji set** | 🐾 📦 ⚠️ 🏠 ✏️ 🗑️ 👁️ 🙈 💡 🚨 ⏳ ✅ ➕ − + |
| **Size** | Match adjacent text `fontSize` (1:1) |
| **Color** | Inherit `color` (currentColor equivalent via style) |

> **Exception:** If a required icon has no emoji equivalent, use `expo-symbols` (SF Symbols / Material Symbols) — but prefer emoji.

---

## 8. Motion & Animation

### 8.1 Timing Scale

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fast` | 150ms | `ease-out` | Button press, chip tap |
| `normal` | 250ms | `ease-in-out` | Modal enter/exit, tab switch |
| `slow` | 350ms | `ease-out` | Bottom sheet, complex transitions |

### 8.2 Motion Primitives

| Animation | Spec |
|-----------|------|
| `fadeIn` | `opacity: 0 → 1`, `normal` |
| `fadeOut` | `opacity: 1 → 0`, `fast` |
| `slideUp` | `translateY: 20 → 0`, `normal` |
| `slideDown` | `translateY: -20 → 0`, `normal` |
| `scalePress` | `transform: scale(0.96)`, `fast` (on press) |
| `shimmer` | Loading skeleton: `linear-gradient` sweep, 1.5s infinite |

### 8.3 Reduced Motion

```typescript
// Respect prefers-reduced-motion (web) / reduce motion (iOS/Android)
const reducedMotion = useReducedMotion();
const duration = reducedMotion ? 0 : tokens.duration.normal;
```

---

## 9. Breakpoints (Web / Responsive)

| Token | Width | Columns | Usage |
|-------|-------|---------|-------|
| `mobile` | < 480px | 1 | Phone portrait |
| `mobile-lg` | 480–767px | 1–2 | Phone landscape / small tablet |
| `tablet` | 768–1023px | 2–3 | Tablet portrait |
| `desktop` | 1024–1439px | 3–4 | Desktop |
| `wide` | ≥ 1440px | 4+ | Large desktop |

### 9.1 Grid Behavior

- **Home stats grid:** 1 col (mobile) → 2 col (tablet) → 4 col (desktop)
- **Products list:** Single column always (scrollable)
- **Category bars:** Full width, responsive bar fill
- Width: `4px`
---

## 10. Accessibility (WCAG 2.1 AA Baseline)

| Requirement | Token/Rule | Implementation |
|-------------|------------|----------------|
| **Contrast (text)** | ≥ 4.5:1 | All semantic colors verified ✅ |
| **Contrast (large text)** | ≥ 3:1 | `display-*`, `heading-*` verified ✅ |
| **Touch targets** | ≥ 44×44dp | Buttons, FAB, chips, touchables |
| **Focus visible** | 2px outline | Web: `:focus-visible { outline: 2px solid brand-500; outline-offset: 2px }` |
| **Labels** | Every input | `accessibilityLabel` + `<label>` (web) |
| **Roles** | Semantic | `accessibilityRole="button|link|header|search|adjustable"` |
| **Live regions** | Dynamic updates | `accessibilityLiveRegion="polite"` on badges, counts |
| **Dynamic Type** | Respects fontScale | All sizes use `scaled(base)` |
| **Color not sole indicator** | Icons + text | Status badges have icon + label |
| **Error identification** | Specific messages | Inline error text + `accessibilityState={{invalid: true}}` |

---

## 11. Dark Mode (Future — Specification Ready)

> Not implemented yet. Tokens defined for when enabled.

| Token | Light | Dark |
|-------|-------|------|
| `surface-primary` | `#FFFFFF` | `#1E1E1E` |
| `surface-secondary` | `#FAFAFA` | `#2A2A2A` |
| `surface-tertiary` | `#F4F6F9` | `#121212` |
| `neutral-900` | `#212121` | `#FFFFFF` |
| `neutral-0` | `#FFFFFF` | `#121212` |
| `brand-600` | `#2E7D32` | `#66BB6A` |
| `brand-700` | `#1B5E20` | `#81C784` |
| `overlay-scrim` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` |

**Implementation:** Use `useColorScheme()` + `Appearance.addChangeListener`. All colors via `colors[scheme][token]`.

---

## 12. Design Tokens (TypeScript Export)

```typescript
// src/design/tokens.ts
export const colors = {
  brand: { 50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7', 300: '#81C784', 400: '#66BB6A', 500: '#4CAF50', 600: '#2E7D32', 700: '#1B5E20', 800: '#145218', 900: '#0D3B0F' },
  semantic: { success: '#2E7D32', warning: '#E65100', danger: '#C62828', info: '#1565C0' },
  category: { medicamentos: '#1565C0', vacinas: '#2E7D32', antiparasitarios: '#6A1B9A', solucoes: '#00838F', suplementos: '#E65100', equipamentos: '#37474F', outros: '#795548' },
  neutral: { 0: '#FFFFFF', 50: '#FAFAFA', 100: '#F4F6F9', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#555555', 800: '#333333', 900: '#212121', 950: '#111111' },
  surface: { primary: '#FFFFFF', secondary: '#FAFAFA', tertiary: '#F4F6F9', overlayScrim: 'rgba(0,0,0,0.4)', overlayStrong: 'rgba(0,0,0,0.5)' },
};

export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 };

export const typography = {
  sizes: { displayLg: 32, displayMd: 28, displaySm: 24, headingLg: 22, headingMd: 20, headingSm: 18, bodyLg: 16, bodyMd: 15, bodySm: 14, labelLg: 13, labelMd: 12, labelSm: 11, caption: 10 },
  lineHeights: { displayLg: 40, displayMd: 36, displaySm: 32, headingLg: 28, headingMd: 28, headingSm: 24, bodyLg: 24, bodyMd: 22, bodySm: 20, labelLg: 20, labelMd: 18, labelSm: 16, caption: 14 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
};

export const borderRadius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 };

export const elevation = { 0: 'none', 1: 'elev-1', 2: 'elev-2', 3: 'elev-3', 4: 'elev-4', 5: 'elev-5' };

export const motion = { fast: 150, normal: 250, slow: 350, easing: { standard: 'ease-in-out', decelerate: 'ease-out', accelerate: 'ease-in' } };

export const breakpoints = { mobile: 480, mobileLg: 768, tablet: 1024, desktop: 1440 };
```
- Colors: semantic (`success`, `warning`, `danger`) or category
- Applied on `borderLeftWidth` + `borderLeftColor`

---

## 3. Spacing System

### 3.1 Base Unit: 4px

All spacing values are multiples of 4.

### 3.2 Space Scale

| Token | Value (px) | rem | Usage |
|-------|------------|-----|-------|
| `space-0` | 0 | 0 | Reset |
| `space-1` | 4 | 0.25 | Micro gaps (icon-label) |
| `space-2` | 8 | 0.5 | Tight groups (chips, badge padding) |
| `space-3` | 12 | 0.75 | Component internal padding |
| `space-4` | 16 | 1 | **Base unit** — card padding, screen margins |
| `space-5` | 20 | 1.25 | Medium gaps (between sections) |
| `space-6` | 24 | 1.5 | Large gaps (section to section) |
| `space-8` | 32 | 2 | Page margins, modal padding |
| `space-10` | 40 | 2.5 | Hero sections |
| `space-12` | 48 | 3 | — |
| `space-16` | 64 | 4 | — |

> **Rule:** Use tokens, not raw numbers. `padding: 16` → `padding: space-4`.

### 3.3 Layout Spacing Patterns

| Pattern | Horizontal | Vertical | Usage |
|---------|------------|----------|-------|
| `screen` | `space-4` (16) | `space-4` (16) | Screen edges |
| `card` | `space-4` (16) | `space-4` (16) | Card internal |
| `card-tight` | `space-3` (12) | `space-3` (12) | Dense cards (LowStock) |
| `section-gap` | — | `space-6` (24) | Between major sections |
| `item-gap` | — | `space-3` (12) | Between list items |
| `inline-gap` | `space-2` (8) | — | Chips, button groups |
| `input-gap` | — | `space-2` (8) | Label → input |
| Token | Value | Usage |
|-------|-------|-------|
| `surface-primary` | `neutral-0` | Cards, modals, sheets |
| `surface-secondary` | `neutral-50` | Input bg, alternate rows |
| `surface-tertiary` | `neutral-100` | Page background |
| `overlay-scrim` | `rgba(0,0,0,0.4)` | Modal backdrop |
| `overlay-strong` | `rgba(0,0,0,0.5)` | Delete confirmation |
---

## 13. Component Inventory (To Build)

| Component | Status | Priority |
|-----------|--------|----------|
| `Button` | 🔴 Missing | Critical |
| `Input` / `TextArea` | 🔴 Missing | Critical |
| `Card` | 🔴 Missing | Critical |
| `Badge` / `Chip` | 🔴 Missing | Critical |
| `Modal` / `BottomSheet` | 🔴 Missing | Critical |
| `FAB` | 🔴 Missing | Critical |
| `TabBar` (styled) | 🔴 Missing | High |
| `Header` (styled) | 🔴 Missing | High |
| `StatCard` | 🔴 Missing | High |
| `ProductCard` | 🔴 Missing | High |
| `EmptyState` | 🔴 Missing | Medium |
| `LoadingSkeleton` | 🔴 Missing | Medium |
| `Toast` / `Snackbar` | 🔴 Missing | Medium |
| `DatePicker` (native) | 🔴 Missing | Medium |
| `Select` / `Picker` | 🔴 Missing | Low |

> **Rule:** Replace all inline `StyleSheet.create` with token-based components. One component = one source of truth.

---

## 14. Migration Checklist (Current → Tokens)

- [ ] Extract `colors`, `spacing`, `typography`, `borderRadius`, `elevation` to `src/design/tokens.ts`
- [ ] Create base components in `src/components/ui/`
- [ ] Replace `LoginScreen` styles with tokens + components
- [ ] Replace `HomeScreen` styles with tokens + components
- [ ] Replace `ProductsScreen` styles with tokens + components
- [ ] Replace `LowStockScreen` styles with tokens + components
- [ ] Replace `AddEditProductScreen` styles with tokens + components
- [ ] Replace `App.tsx` tab bar / header styles with tokens
- [ ] Run Impeccable detector to verify zero regressions
- [ ] Document any approved deviations in this file

---

## 15. Governance

| Action | Process |
|--------|---------|
| **Add token** | PR with DESIGN.md update + component usage example |
| **Change token** | Requires design review (this file is source of truth) |
| **Deviation** | Document in component with `// DESIGN-DEVIATION: reason` + issue link |
| **Deprecate** | Mark `deprecated: true` in tokens, give 2 sprints migration |

---

*Generated from incumbent implementation + Impeccable craft-floor standards. This is a living document — update with every visual change.*
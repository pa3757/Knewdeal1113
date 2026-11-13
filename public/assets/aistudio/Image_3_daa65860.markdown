---
name: Electric Pulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5a4136'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#a73a00'
  on-secondary: '#ffffff'
  secondary-container: '#fd651e'
  on-secondary-container: '#571a00'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00ae78'
  on-tertiary-container: '#003925'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  metric-headline:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system bridges complex energy commodity market data and everyday utility users. It transforms technical grid statistics, SMP (System Marginal Price), and peak usage forecasts into clear, human-centered insights for beginners monitoring real-time power rates.

The visual personality is:
- **Intelligently Optimistic**: Energetic without feeling chaotic, pairing data density with generous breathing room.
- **Utilitarian & Clear**: Uncompromising legibility with high-contrast text, clear visual signposts, and low cognitive overhead.
- **Modern & Fluid**: A light-mode-first aesthetic that uses crisp surfaces, sharp borders, and subtle dimensional layering instead of heavy skeuomorphic decoration.

Drawing from modern high-performance fintech and clean analytical interfaces, the aesthetic balances functional data grids with high-impact key figures.

## Colors

The palette establishes an immediate focal hierarchy using a signature electric orange accent against a slate foundation.

- **Primary & Secondary (`#FF6B00`, `#EA580C`)**: Represents live electrical energy and critical callouts. Reserved strictly for primary action states, real-time indicator badges, focal metric values, and current-hour chart bars.
- **Neutral Core (`#0F172A`, `#334155`, `#64748B`, `#94A3B8`, `#E2E8F0`, `#F1F5F9`, `#F8FAFC`, `#FFFFFF`)**: Deep slate grays anchor headlines and metrics (`#0F172A`), supportive descriptions and secondary values sit in `#475569`, and muted metadata rests in `#64748B`. Surfaces start from a crisp `#F8FAFC` base with `#FFFFFF` card layers and hairline borders (`#E2E8F0`).
- **Semantic Market Signals**:
  - Positive / Upward Trend / Renewable Surplus: `#10B981` (Emerald) with soft background `#ECFDF5`.
  - Peak / Downward Trend / Overcapacity: `#F43F5E` (Rose) with soft background `#FFF1F2`.
  - Stable / Baseline: `#64748B` (Slate).

Avoid overusing the orange tone; its power relies on resting against neutral white and slate planes.

## Typography

The type system is powered by Inter (with systematic native fallbacks to Pretendard and system sans-serif for Korean glyph parity). 

- **Tabular Figures**: All market figures, price per kilowatt-hour (kWh), percentages, and time indices require tabular numerals (`font-feature-settings: 'tnum' 1, 'cv05' 1`) to ensure numeric alignment across stacked price lists.
- **Korean Typographic Harmonization**: When rendering Korean strings like "오늘의 전기 시세" and technical abbreviations (SMP, REC), line heights are kept at a generous ratio (1.45–1.55) to prevent baseline clipping.
- **Hierarchy & Weight Distribution**: Display and metric weights (`font-weight: 700` and `800`) are strictly paired with smaller, slate-colored labels (`font-weight: 500`) to create a calm contrast between raw numbers and descriptive terms.

## Layout & Spacing

The layout is built upon an 8-point baseline grid configured as a structured, responsive dashboard.

- **Desktop (1024px and above)**: 12-column layout with max-width constrained to `1280px` centered canvas, `margin: 2rem`, and `gutter: 1.5rem`. The page layout groups high-level real-time rate cards across the top (4 columns each), followed by a primary 8-column intraday chart section paired with a 4-column breakdown and status feed.
- **Tablet (768px - 1023px)**: 8-column layout, `margin: 1.5rem`, `gutter: 1rem`. Cards span 4 columns to create clean 2x2 grids for core metrics.
- **Mobile (< 768px)**: 4-column layout, `margin: 1rem`, `gutter: 0.75rem`. Cards collapse into single-column vertical flows. Critical tickers and metric indicators gain horizontal scrollability with fixed edge margins to ensure zero line-wrapping on currency units.

## Elevation & Depth

Visual hierarchy uses a clean-room approach that replaces fuzzy shadows with crisp layered surfaces and micro-borders:

- **Surface Level 0 (Canvas)**: Background `#F8FAFC`.
- **Surface Level 1 (Default Card)**: Background `#FFFFFF`, border `1px solid #E2E8F0`, subtle shadow `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Surface Level 2 (Interactive & Hovered Cards)**: Background `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Surface Level 3 (Modals, Overlays, Dropdowns)**: Background `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Accent Glow**: For live status indicators or active peak-rate indicators, an orange focus halo is applied using `0 0 0 3px rgba(255, 107, 0, 0.15)`.

## Shapes

The interface balances sharp analytical rigor with approachable soft curvature:

- **Cards & Data Containers**: Base radius is `rounded-lg` (`1rem` / `16px`), giving complex charts a friendly framing.
- **Buttons, Form Controls & Inputs**: Base radius is `rounded` (`0.5rem` / `8px`), offering tight, clickable boundaries.
- **Status Pills, Tickers & Metric Badges**: Explicitly set to pill radii (`9999px`) to immediately distinguish contextual tags from interactive containers.

## Components

### Buttons
- **Primary**: Background `#FF6B00`, text `#FFFFFF`, font-weight 600, border radius `8px`. Hover state shifts to `#EA580C`. Active state adds `transform: scale(0.98)`.
- **Secondary / Ghost**: Background `#F1F5F9`, text `#334155`, border `1px solid transparent`. Hover shifts to background `#E2E8F0` and text `#0F172A`.
- **Outline**: Background transparent, border `1px solid #CBD5E1`, text `#334155`. Hover shifts to `#F8FAFC`.

### Metric Summary Cards
- White `#FFFFFF` background, `16px` padding, `16px` border radius, micro-border `#E2E8F0`.
- Top: Label in `label-md` (`#64748B`) paired with a category pill badge.
- Middle: Large data value in `metric-headline` (`#0F172A`) with currency indicator `원/kWh` rendered in `headline-sm` (`#64748B`).
- Bottom: Delta comparison tag (e.g., `+12.4% vs 어제`) using Emerald (`#10B981`) or Rose (`#F43F5E`) pill chips.

### Chips & Badges
- **Status Badges**: Pill-shaped (`rounded-full`), padding `2px 8px`, `font-size: 11px`, `font-weight: 600`.
  - Normal/Off-peak: `#F1F5F9` background, `#475569` text.
  - Critical Peak: `#FFF1F2` background, `#E11D48` text.
  - Live Rate: `#FFF7ED` background, `#EA580C` text with a blinking `6px` orange indicator dot.

### Inputs & Time Selectors
- Height `40px`, border `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`. Focus rings strictly use `outline: none; box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.2); border-color: #FF6B00;`.

### Time Series Visualizers & Charts
- Hourly bar cards: Background `#F1F5F9` on non-active bars; the current hour bar is highlighted in `#FF6B00` with a subtle top-cap radius (`4px`). Hover states display an elevation-3 tooltip with complete SMP, forecast price, and peak status.
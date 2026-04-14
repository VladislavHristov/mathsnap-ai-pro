# MathSnap AI Pro — Mobile App Design

## Overview

MathSnap AI Pro is a mobile-first application that empowers students to solve math problems by taking photos. The app combines OCR (Mathpix), AI classification (OpenAI), and symbolic solving (Wolfram Alpha) to provide step-by-step Bulgarian-language explanations with optional function graphs.

**Design Principles:**
- Mobile portrait orientation (9:16) with one-handed usage
- Apple Human Interface Guidelines (HIG) alignment
- Clean, educational interface with clear hierarchy
- Fast feedback and minimal friction

---

## Screen List

1. **Home Screen** — Main entry point with quick actions
2. **Camera Screen** — Capture or upload math problem photo
3. **Problem Detail Screen** — Display extracted problem, classification, and solution
4. **Solution Steps Screen** — Full step-by-step walkthrough
5. **Graph Screen** — Visualize functions (if applicable)
6. **History Screen** — Browse previously solved problems
7. **Favorites Screen** — Saved favorite solutions
8. **Settings Screen** — App preferences, dark mode, language

---

## Primary Content and Functionality

### 1. Home Screen
**Content:**
- App header with logo and title
- "Take Photo" primary button (large, prominent)
- "Upload Image" secondary button
- Quick stats: "Problems Solved Today", "Favorites"
- Recent problems carousel (last 3-5 solved)
- Navigation tabs: Home, History, Favorites, Settings

**Functionality:**
- Navigate to Camera Screen on "Take Photo"
- Navigate to image picker on "Upload Image"
- Tap recent problem to view solution
- Tab navigation to other screens

### 2. Camera Screen
**Content:**
- Full-screen camera preview
- Capture button (centered bottom)
- Gallery/upload button (bottom-left)
- Cancel button (top-left)
- Optional: Focus indicator, grid overlay

**Functionality:**
- Capture photo of math problem
- Switch between front/back camera
- Access photo library
- Auto-crop detected problem area (if possible)
- Submit to backend for processing

### 3. Problem Detail Screen
**Content:**
- Extracted problem (rendered LaTeX or image)
- Problem classification badge (e.g., "Algebra", "Calculus")
- Difficulty indicator (Easy/Medium/Hard)
- "View Solution" button
- "Save to Favorites" button
- "Share" button
- Loading state during processing

**Functionality:**
- Display OCR-extracted problem
- Show classification and difficulty
- Navigate to Solution Steps Screen
- Add/remove from favorites
- Share problem and solution

### 4. Solution Steps Screen
**Content:**
- Problem statement (top, sticky)
- Step-by-step solution (scrollable list)
  - Each step: numbered, with explanation and formula
  - Bulgarian language throughout
- Final answer (highlighted, large font)
- "View Graph" button (if applicable)
- "Copy Solution" button
- "Export to PDF" button

**Functionality:**
- Display all steps from AI solver
- Scroll through long solutions
- Tap to expand/collapse steps
- View graph visualization
- Copy or export solution

### 5. Graph Screen
**Content:**
- Full-screen graph visualization
- Function equation (top)
- Coordinate system with key points highlighted
- Zoom/pan controls
- "Back" button

**Functionality:**
- Render function graph using Recharts/Chart.js
- Zoom and pan interaction
- Display critical points (roots, extrema, etc.)
- Return to solution steps

### 6. History Screen
**Content:**
- List of all solved problems (newest first)
- Each item: problem thumbnail, problem type, date solved
- Search/filter bar (by type, date, difficulty)
- Empty state: "No problems solved yet"

**Functionality:**
- Tap to view solution
- Swipe to delete
- Filter by problem type
- Search by keywords

### 7. Favorites Screen
**Content:**
- Grid or list of favorited problems
- Same items as History but only starred problems
- Empty state: "No favorites yet"

**Functionality:**
- Tap to view solution
- Swipe to remove from favorites
- Share favorite solution

### 8. Settings Screen
**Content:**
- Dark mode toggle
- Language selection (Bulgarian/English)
- Clear cache button
- About section
- Privacy/Terms links
- Version number

**Functionality:**
- Toggle dark mode
- Switch language
- Clear app cache
- Open links in browser

---

## Key User Flows

### Flow 1: Solve a Problem (Primary)
1. User taps "Take Photo" on Home Screen
2. Camera Screen opens
3. User captures or uploads image of math problem
4. App shows loading state
5. Problem Detail Screen displays extracted problem and classification
6. User taps "View Solution"
7. Solution Steps Screen shows full step-by-step explanation
8. User can view graph, copy, or export

### Flow 2: Browse History
1. User navigates to History Screen
2. Sees list of previously solved problems
3. Taps a problem to view its solution
4. Can filter by type or search

### Flow 3: Save and Revisit Favorites
1. While viewing a solution, user taps "Save to Favorites"
2. Problem is added to Favorites Screen
3. Later, user navigates to Favorites
4. Taps a favorite to view solution again

### Flow 4: Customize Settings
1. User navigates to Settings Screen
2. Toggles dark mode or changes language
3. Changes persist across app sessions

---

## Color Choices

**Brand Colors:**
- **Primary (Accent):** `#0A7EA4` (Professional Blue) — Used for buttons, links, highlights
- **Secondary:** `#FF6B35` (Warm Orange) — Used for success states, highlights
- **Background (Light):** `#FFFFFF` (White) — Light mode background
- **Background (Dark):** `#151718` (Deep Gray) — Dark mode background
- **Surface (Light):** `#F5F5F5` (Light Gray) — Cards, inputs
- **Surface (Dark):** `#1E2022` (Charcoal) — Cards, inputs in dark mode
- **Foreground (Light):** `#11181C` (Dark Gray) — Primary text
- **Foreground (Dark):** `#ECEDEE` (Off-White) — Primary text in dark mode
- **Muted (Light):** `#687076` (Medium Gray) — Secondary text
- **Muted (Dark):** `#9BA1A6` (Light Gray) — Secondary text in dark mode
- **Success:** `#22C55E` (Green) — Success messages
- **Error:** `#EF4444` (Red) — Error messages
- **Warning:** `#F59E0B` (Amber) — Warning messages

**Rationale:**
- Professional blue conveys trust and education
- Warm orange adds energy and highlights key actions
- High contrast for accessibility
- Dark mode support for eye comfort

---

## Typography

- **Headings:** System font (SF Pro Display on iOS, Roboto on Android), bold, 24-28px
- **Body:** System font, regular, 16px
- **Captions:** System font, regular, 14px
- **Math formulas:** Monospace font, 14-16px

---

## Layout Grid

- **Spacing unit:** 4px (multiples: 8, 12, 16, 20, 24, 32)
- **Padding:** 16px (standard), 12px (compact)
- **Corner radius:** 12px (cards), 8px (buttons)
- **Safe area:** Respect notch and home indicator

---

## Interaction Patterns

- **Primary buttons:** Scale 0.97 on press + light haptic
- **List items:** Opacity 0.7 on press
- **Loading:** Spinner or skeleton loader
- **Success:** Green checkmark + success haptic
- **Error:** Red banner + error haptic + retry option

---

## Accessibility

- Minimum touch target: 44×44pt
- Color contrast: WCAG AA or higher
- Support for VoiceOver (iOS) and TalkBack (Android)
- Clear labels for all interactive elements
- Keyboard navigation support

---

## Performance Considerations

- Lazy load graph component
- Cache OCR and classification results
- Compress images before upload
- Paginate history/favorites lists
- Minimize re-renders with memoization


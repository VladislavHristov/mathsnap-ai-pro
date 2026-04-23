# MathSnap AI Pro — APIs and AI Services Used

## Overview

MathSnap AI Pro uses a **hybrid AI pipeline** that combines multiple specialized services to solve math problems. The pipeline consists of three main stages:

1. **OCR (Optical Character Recognition)** — Extract text from images
2. **Classification** — Analyze the problem type and difficulty
3. **Solving** — Generate step-by-step solutions using the appropriate solver

---

## Complete Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Takes Photo / Uploads Image            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: OCR (Optical Character Recognition)                   │
│  Service: Google Vision API                                      │
│  Input: Base64 image or image URL                               │
│  Output: Extracted text and LaTeX                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: Classification                                         │
│  Service: Google Gemini 2.5 Flash (via Forge API)              │
│  Input: Extracted text/LaTeX                                    │
│  Output: Problem type, difficulty, solver requirements          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
        requires_symbolic_solver      │
            = true                    │
                    │                 │
                    ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Wolfram Alpha    │  │ Google Gemini    │
        │ (Symbolic)       │  │ (Step-by-step)   │
        │ + Graph          │  │ (Bulgarian)      │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: Solution Display                                       │
│  Output: Steps, final answer, explanation (in Bulgarian)        │
│  Optional: Graph/plot visualization                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: OCR (Text Extraction)

### Service: **Google Vision API**

**Endpoint:** `https://vision.googleapis.com/v1/images:annotate`

**Purpose:** Extract mathematical text and equations from images

**Features:**
- TEXT_DETECTION for general text recognition
- DOCUMENT_TEXT_DETECTION for structured text
- Supports both base64-encoded images and URLs
- Language hints: English and Bulgarian

**Configuration:**
```typescript
{
  "requests": [{
    "image": {
      "content": base64Image  // or "source": { "imageUri": url }
    },
    "features": [
      { "type": "TEXT_DETECTION", "maxResults": 10 },
      { "type": "DOCUMENT_TEXT_DETECTION" }
    ],
    "imageContext": {
      "languageHints": ["en", "bg"]
    }
  }]
}
```

**Response:**
```typescript
{
  "latex": "extracted mathematical text",
  "text": "extracted plain text"
}
```

**Authentication:** API Key (`GOOGLE_VISION_API_KEY`)

---

## Stage 2: Problem Classification

### Service: **Google Gemini 2.5 Flash** (via Forge API)

**Endpoint:** `https://forge.manus.im/v1/chat/completions`

**Model:** `gemini-2.5-flash`

**Purpose:** Analyze the math problem and determine:
- Problem type (algebra, calculus, geometry, trigonometry, statistics, other)
- Difficulty level (easy, medium, hard)
- Whether a graph/visualization would help
- Whether symbolic solving (Wolfram Alpha) is needed

**Classification Prompt:**
```
You are a mathematics expert. Analyze the following math problem and classify it.

Return ONLY a valid JSON object with this exact structure:
{
  "type": "algebra|calculus|geometry|trigonometry|statistics|other",
  "difficulty": "easy|medium|hard",
  "requires_graph": true/false,
  "requires_symbolic_solver": true/false,
  "description": "Brief description of the problem"
}
```

**Classification Response:**
```typescript
{
  "type": "algebra",
  "difficulty": "medium",
  "requires_graph": false,
  "requires_symbolic_solver": true,
  "description": "Solve quadratic equation with complex roots"
}
```

**Authentication:** Bearer token (`FORGE_API_KEY`)

---

## Stage 3: Problem Solving

### Option A: **Wolfram Alpha API** (for symbolic/complex problems)

**Endpoint:** `https://api.wolframalpha.com/v2/query`

**Purpose:** Solve symbolic math problems and generate graphs

**When Used:**
- `classification.requires_symbolic_solver === true`
- Problems requiring symbolic computation (derivatives, integrals, equations, etc.)
- When step-by-step solutions are needed from Wolfram

**Query Parameters:**
```
{
  "input": "problem_latex_or_text",
  "appid": WOLFRAM_APP_ID,
  "output": "json",
  "format": "plaintext",
  "includepodid": "Solution,Step-by-step solution,Result,Plot"
}
```

**Response Structure:**
```typescript
{
  "queryresult": {
    "success": true,
    "pods": [
      {
        "id": "Solution",
        "subpods": [{ "plaintext": "x = 5" }]
      },
      {
        "id": "Step-by-step solution",
        "subpods": [
          { "plaintext": "Step 1: ..." },
          { "plaintext": "Step 2: ..." }
        ]
      },
      {
        "id": "Plot",
        "subpods": [{ "image": { "src": "https://..." } }]
      }
    ]
  }
}
```

**Output:**
```typescript
{
  "input": "x^2 - 5x + 6 = 0",
  "result": "x = 2 or x = 3",
  "steps": ["Step 1: ...", "Step 2: ..."],
  "has_graph": true
}
```

**Authentication:** App ID (`WOLFRAM_APP_ID`)

**Graph Retrieval:**
- Wolfram Alpha returns plot images in the `Plot` pod
- Image URLs are used directly in the mobile app
- Format: PNG images suitable for mobile display

---

### Option B: **Google Gemini 2.5 Flash** (for step-by-step explanations)

**Endpoint:** `https://forge.manus.im/v1/chat/completions`

**Model:** `gemini-2.5-flash`

**Purpose:** Generate detailed step-by-step solutions in Bulgarian

**When Used:**
- `classification.requires_symbolic_solver === false`
- General math problems that don't need symbolic computation
- As fallback if Wolfram Alpha fails

**Solver Prompt (Bulgarian):**
```
Ти си професионален учител по математика.

Реши задачата стъпка по стъпка.

Правила:
- Разбий решението на ясни логични стъпки
- Използвай прости обяснения
- Покажи всички формули
- Не пропускай стъпки
- Ако има множество методи, използвай най-простия
- Всички отговори трябва да са на BULGARIAN език

Върни САМО валиден JSON:
{
  "problem": "...",
  "steps": ["...", "..."],
  "final_answer": "...",
  "explanation": "..."
}

Задача: {{LATEX_FROM_OCR}}
```

**Solution Response:**
```typescript
{
  "problem": "Реши уравнението: 2x + 5 = 13",
  "steps": [
    "Вычтем 5 от обеих сторон: 2x = 8",
    "Разделим на 2: x = 4"
  ],
  "final_answer": "x = 4",
  "explanation": "Това е линейно уравнение. Решихме го чрез изолиране на x."
}
```

**Authentication:** Bearer token (`FORGE_API_KEY`)

---

## API Keys Required

| Service | Environment Variable | Purpose | Status |
|---------|---------------------|---------|--------|
| Google Vision | `GOOGLE_VISION_API_KEY` | OCR text extraction | ✅ Required |
| Wolfram Alpha | `WOLFRAM_APP_ID` | Symbolic solving & graphs | ✅ Required |
| Forge (Gemini) | `FORGE_API_KEY` | Classification & step-by-step solving | ✅ Required |

---

## Request/Response Flow

### Complete Example: Solving a Quadratic Equation

**Input:** Image of problem "x² - 5x + 6 = 0"

**Step 1: OCR (Google Vision)**
```
Input: Base64 image
Output: 
{
  "latex": "x^2 - 5x + 6 = 0",
  "text": "x squared minus 5x plus 6 equals 0"
}
```

**Step 2: Classification (Gemini)**
```
Input: "x^2 - 5x + 6 = 0"
Output:
{
  "type": "algebra",
  "difficulty": "medium",
  "requires_graph": false,
  "requires_symbolic_solver": true,
  "description": "Solve quadratic equation"
}
```

**Step 3: Solving (Wolfram Alpha)**
```
Input: "x^2 - 5x + 6 = 0"
Output:
{
  "input": "x^2 - 5x + 6 = 0",
  "result": "x = 2 or x = 3",
  "steps": [
    "Factor: (x - 2)(x - 3) = 0",
    "Set each factor to zero: x - 2 = 0 or x - 3 = 0",
    "Solve: x = 2 or x = 3"
  ],
  "has_graph": true
}
```

**Final Output to User (in Bulgarian):**
```
Задача: x² - 5x + 6 = 0
Тип: Алгебра
Трудност: Средна
Решител: Wolfram Alpha

Стъпки:
1. Факторизирай: (x - 2)(x - 3) = 0
2. Приравни всеки множител на нула: x - 2 = 0 или x - 3 = 0
3. Реши: x = 2 или x = 3

Отговор: x = 2 или x = 3
```

---

## Error Handling & Fallback Strategy

```
┌─ Wolfram Alpha fails?
│  └─ Fall back to Gemini (OpenAI-style solver)
│
├─ Google Vision fails?
│  └─ Return error to user: "Could not extract text from image"
│
└─ Gemini fails?
   └─ Return error to user: "Could not generate solution"
```

---

## Performance Characteristics

| Service | Typical Latency | Rate Limits | Cost |
|---------|-----------------|-------------|------|
| Google Vision | 1-3 seconds | 1,000 req/day free tier | $1.50 per 1,000 images |
| Wolfram Alpha | 2-5 seconds | 2,000 req/month free | $0.001 per query (paid) |
| Gemini 2.5 Flash | 1-2 seconds | Varies by plan | ~$0.075 per 1M tokens |

---

## Summary

**MathSnap AI Pro** leverages three complementary AI/API services:

1. **Google Vision API** — Extracts mathematical text from images with high accuracy
2. **Google Gemini 2.5 Flash** — Classifies problems and generates step-by-step explanations in Bulgarian
3. **Wolfram Alpha API** — Solves complex symbolic math problems and generates visualization graphs

The **hybrid approach** ensures optimal results:
- Simple problems get fast, clear explanations from Gemini
- Complex problems get symbolic solutions and graphs from Wolfram Alpha
- All solutions are delivered in **Bulgarian** for the target audience

This architecture balances **accuracy, speed, and cost** while providing a seamless user experience.

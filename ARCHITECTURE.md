# Modern Forms - Architecture & Data Flow

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODERN FORMS - REQUEST FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              1. FORM INPUT PHASE                             │
└─────────────────────────────────────────────────────────────────────────────┘

    User enters Google Form URL
            │
            ▼
    ┌───────────────────┐
    │   FormUrlInput    │  (src/components/creator/FormUrlInput.tsx)
    │   Component       │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐     ┌─────────────────────────────────────┐
    │  fetchGoogleForm  │────▶│  Vite Proxy (/api/form/...)        │
    │  (formParser.ts)  │     │  Rewrites to docs.google.com       │
    └─────────┬─────────┘     │  (Bypasses CORS)                   │
              │               └─────────────────────────────────────┘
              ▼
    ┌───────────────────┐
    │ parseGoogleForm   │  Extracts FB_PUBLIC_LOAD_DATA_ JSON
    │ Html()            │  from Google Form HTML
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │   ParsedForm      │  { id, title, description, questions[], submitUrl }
    │   Object          │
    └─────────┬─────────┘
              │
              ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                           2. CREATOR STUDIO PHASE                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                        CreatorStudio.tsx                             │
    │  ┌─────────────────┐  ┌──────────────────────────────────────────┐  │
    │  │  LEFT SIDEBAR   │  │           PREVIEW AREA                   │  │
    │  │                 │  │                                          │  │
    │  │ ┌─────────────┐ │  │  ┌────────────────────────────────────┐  │  │
    │  │ │Layout Toggle│ │  │  │  Desktop / Mobile Toggle           │  │  │
    │  │ │Standard|QbyQ│ │  │  └────────────────────────────────────┘  │  │
    │  │ └─────────────┘ │  │                                          │  │
    │  │                 │  │  ┌────────────────────────────────────┐  │  │
    │  │ ┌─────────────┐ │  │  │                                    │  │  │
    │  │ │Theme        │ │  │  │   StandardLayout                   │  │  │
    │  │ │Selector     │ │  │  │        OR                          │  │  │
    │  │ │(10 themes)  │ │  │  │   QuestionByQuestionLayout         │  │  │
    │  │ └─────────────┘ │  │  │                                    │  │  │
    │  │                 │  │  │   (Live preview with theme)        │  │  │
    │  │ ┌─────────────┐ │  │  │                                    │  │  │
    │  │ │Generate     │ │  │  └────────────────────────────────────┘  │  │
    │  │ │Theme Button │ │  │                                          │  │
    │  │ └─────────────┘ │  └──────────────────────────────────────────┘  │
    │  │                 │                                                 │
    │  │ ┌─────────────┐ │  ┌──────────────────────────────────────────┐  │
    │  │ │Color        │ │  │  [Create & Copy Link] Button             │  │
    │  │ │Customizer   │ │  └──────────────────────────────────────────┘  │
    │  │ └─────────────┘ │                                                 │
    │  └─────────────────┘                                                 │
    └─────────────────────────────────────────────────────────────────────┘
              │
              │ User clicks "Generate Theme"
              ▼
    ┌───────────────────┐
    │ generateTheme     │  (src/utils/imageSearch.ts)
    │ FromForm()        │
    └─────────┬─────────┘
              │
              ├──▶ extractKeywords(title, description)
              │         │
              │         ▼
              │    ["graphic", "designer", "job", "application"]
              │         │
              ├──▶ determineCategory(keywords)
              │         │
              │         ▼
              │    "creative" (maps "designer" → creative)
              │         │
              ├──▶ getRandomImageFromCategory("creative", 1200, 400)
              │         │
              │         ▼
              │    https://picsum.photos/id/145/1200/400
              │         │
              ├──▶ getColorPaletteForCategory("creative")
              │         │
              │         ▼
              │    { primary: '#EC4899', secondary: '#DB2777', ... }
              │
              ▼
    ┌───────────────────┐
    │   ThemeConfig     │  Applied to preview instantly
    │   Object          │
    └─────────┬─────────┘
              │
              │ User clicks "Create & Copy Link"
              ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                            3. SAVE & SHARE PHASE                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐
    │ saveFormConfig()  │  (src/utils/storage.ts)
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────────────────┐
    │           localStorage                     │
    │                                           │
    │  Key: "modern-forms-{uuid}"               │
    │  Value: {                                 │
    │    formId,                                │
    │    parsedForm,                            │
    │    layoutMode: "standard"|"question-by-   │
    │                 question",                │
    │    standardTheme: ThemeConfig,            │
    │    questionByQuestionTheme: ThemeConfig,  │
    │    headerImageUrl,                        │
    │    createdAt                              │
    │  }                                        │
    └───────────────────────────────────────────┘
              │
              ▼
    ┌───────────────────┐
    │ Copy to clipboard │  https://yoursite.com/?f={uuid}
    └─────────┬─────────┘
              │
              ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                          4. RESPONDENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Respondent opens shared link: ?f={uuid}
              │
              ▼
    ┌───────────────────┐
    │  App.tsx useEffect│  Checks URL params on mount
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ getFormConfig()   │  Retrieves from localStorage
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │                     FORM RENDERING                                 │
    │                                                                    │
    │   layoutMode === "standard"        layoutMode === "question-by-   │
    │          │                                  question"             │
    │          ▼                                      │                 │
    │   ┌─────────────────┐                          ▼                 │
    │   │ StandardLayout  │              ┌─────────────────────────┐   │
    │   │                 │              │QuestionByQuestionLayout │   │
    │   │ All questions   │              │                         │   │
    │   │ on one page     │              │ One question per screen │   │
    │   │                 │              │ Progress bar            │   │
    │   │ Theme applied   │              │ Auto-advance on select  │   │
    │   │ via inline      │              │ Previous/Next buttons   │   │
    │   │ styles          │              │ Review screen           │   │
    │   └─────────────────┘              └─────────────────────────┘   │
    │          │                                      │                 │
    │          └──────────────┬───────────────────────┘                 │
    │                         ▼                                         │
    │              ┌─────────────────┐                                  │
    │              │QuestionRenderer │                                  │
    │              │ + theme prop    │                                  │
    │              └────────┬────────┘                                  │
    │                       │                                           │
    │    ┌──────────────────┼──────────────────┐                        │
    │    ▼                  ▼                  ▼                        │
    │ ShortAnswer    MultipleChoice      Checkboxes    ... etc         │
    │ (themed)       (themed)            (themed)                       │
    └───────────────────────────────────────────────────────────────────┘
              │
              │ User fills form and clicks Submit
              ▼
    ┌───────────────────┐
    │submitFormResponse │  (src/utils/formParser.ts)
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────────────────┐
    │  POST to Google Forms                      │
    │                                           │
    │  URL: /api/form/d/e/{formId}/formResponse │
    │       (proxied to docs.google.com)        │
    │                                           │
    │  Body: FormData with entry.* fields       │
    │        e.g., entry.123456789: "Answer"    │
    └───────────────────────────────────────────┘
              │
              ▼
    ┌───────────────────┐
    │  Success Screen   │  "Response Submitted"
    │  (themed)         │
    └───────────────────┘
```

---

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main router - switches between input, creator, and respond views |
| `src/utils/formParser.ts` | Fetches & parses Google Form HTML, submits responses |
| `src/utils/storage.ts` | Saves/retrieves form configs from localStorage |
| `src/utils/imageSearch.ts` | Generates themes with Lorem Picsum images |
| `src/components/creator/CreatorStudio.tsx` | Main customization UI with sidebar + preview |
| `src/components/layouts/StandardLayout.tsx` | All-questions-on-one-page layout |
| `src/components/layouts/QuestionByQuestionLayout.tsx` | One-question-per-screen layout |
| `src/components/questions/index.tsx` | Routes to correct question component with theme |

---

## Data Types

### ParsedForm
```typescript
interface ParsedForm {
  id: string;                    // Google Form ID
  title: string;                 // Form title
  description?: string;          // Form description
  questions: FormQuestion[];     // Array of questions
  submitUrl: string;             // Google Forms submission URL
}
```

### FormQuestion
```typescript
interface FormQuestion {
  id: string;                    // Internal question ID
  entryId: string;               // Google's entry.* field name
  title: string;                 // Question text
  description?: string;          // Help text
  type: QuestionType;            // short_answer, multiple_choice, etc.
  required: boolean;
  options?: FormOption[];        // For choice questions
  scaleStart?: number;           // For linear scale
  scaleEnd?: number;
  scaleLabels?: ScaleLabels;
}
```

### ThemeConfig
```typescript
interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;           // primary, secondary, background, etc.
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fontFamily: string;
  headerImageUrl?: string;
  backgroundImageUrl?: string;
}
```

### FormConfig (Saved to localStorage)
```typescript
interface FormConfig {
  formId: string;
  parsedForm: ParsedForm;
  layoutMode: 'standard' | 'question-by-question';
  headerImageUrl?: string;
  createdAt: number;
  standardTheme?: ThemeConfig;
  questionByQuestionTheme?: ThemeConfig;
}
```

---

## Data Flow Summary

1. **Parse**: Google Form URL → HTML → `FB_PUBLIC_LOAD_DATA_` JSON → `ParsedForm`
2. **Customize**: User selects theme/colors → `ThemeConfig` object
3. **Save**: `FormConfig` (form + theme + layout) → localStorage with UUID
4. **Share**: UUID in URL query param → retrieves config → renders themed form
5. **Submit**: Form responses → POST to original Google Form endpoint

---

## Component Hierarchy

```
App.tsx
├── FormUrlInput (view: 'input')
│   └── Handles URL submission
│
├── CreatorStudio (view: 'creator')
│   ├── ThemeSelector
│   │   └── 10 preset theme cards
│   ├── ColorCustomizer
│   │   └── HexColorPicker for each color
│   └── PreviewContent
│       ├── StandardLayout (isPreview=true)
│       └── QuestionByQuestionLayout (isPreview=true)
│
└── Response View (view: 'respond')
    ├── StandardLayout
    │   └── QuestionRenderer → [ShortAnswer, MultipleChoice, ...]
    └── QuestionByQuestionLayout
        ├── Welcome Screen
        ├── Question Screen (with QuestionRenderer)
        ├── Review Screen
        └── Success Screen
```

---

## CORS Proxy Configuration

The app uses Vite's proxy to bypass CORS restrictions when fetching Google Forms:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/form': {
      target: 'https://docs.google.com/forms',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/form/, ''),
    },
  },
}
```

**Request flow:**
- App requests: `/api/form/d/e/{formId}/viewform`
- Vite rewrites to: `https://docs.google.com/forms/d/e/{formId}/viewform`
- Response returned to app without CORS issues

---

## Theme Generation Algorithm

```
1. Extract keywords from title + description
   "Graphic Designer Job Application" → ["graphic", "designer", "job", "application"]

2. Map keywords to category
   "designer" → "creative"
   "graphic" → "creative"

3. Select image from category pool
   creative: [96, 145, 169, 200, 250] → random pick → 145
   URL: https://picsum.photos/id/145/1200/400

4. Apply category color palette
   creative: {
     primary: '#EC4899',
     secondary: '#DB2777',
     background: '#FDF2F8',
     ...
   }
```

**Category mappings:**
- `business`: job, career, work, company, corporate, interview
- `technology`: tech, software, code, programming, developer
- `education`: school, student, teacher, course, university
- `creative`: design, art, graphic, designer, artist
- `health`: medical, doctor, wellness, fitness
- `food`: restaurant, recipe, cooking, menu
- `travel`: trip, vacation, tourism, hotel
- `nature`: environment, outdoor, garden, eco

# AI Resume Builder — KodNest

A premium, browser-based resume builder designed to help developers and professionals create ATS-friendly, high-impact resumes. Built with a focus on structure, content quality, and clean design.

## 🚀 Features

- **Real-time Builder**: Interactive form with immediate visual feedback.
- **Live Preview**: See your resume evolve as you type.
- **ATS Scoring Engine**: Built-in deterministic scoring system (0-100) that analyzes your resume for:
  - Content length and depth
  - Use of action verbs and measurable metrics (numbers/%)
  - Keyword density and section completeness
- **Multiple Templates**: Switch instantly between **Classic**, **Modern**, and **Minimal** designs.
- **Auto-Save**: specialized persistence layer saves your progress to `localStorage` automatically.
- **PDF Export**: Optimized print CSS for clean PDF generation.
- **Smart Suggestions**: Context-aware hints to improve your bullet points and summary.

## 🛠️ Tech Stack

- **Core**: HTML5, Modern CSS3, Vanilla JavaScript (ES6+).
- **Architecture**: Single Page Application (SPA) structure within a tailored DOM manipulation engine.
- **Styling**: Custom CSS design system with variable-based theming.
- **Storage**: Browser `localStorage` for data persistence.

## 📂 Project Structure

```
/
├── index.html      # Main application entry point
├── styles.css      # Global design system and component styles
├── script.js       # Core application logic, routing, and rendering
└── README.md       # Project documentation
```

## ⚡ How to Run

1.  **Clone** or **Download** the repository.
2.  Open `index.html` in any modern web browser.
3.  **Start Building**:
    - Click **"Start Building"** to enter the editor.
    - Use **"Load Sample"** to populate the specific fields with demo data.
    - Click **"Print / Save PDF"** to export your document.

## 🧪 Verification & Proof

The project includes a `/proof` route (accessible via the UI or URL hash) to verify the build status, check off test cases, and generate a final submission artifact.

---

**KodNest Projects** — *Build things that matter.*

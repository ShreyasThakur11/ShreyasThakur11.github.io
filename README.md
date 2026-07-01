# Shreyas Thakur — Portfolio Website

A premium, executive-grade digital portfolio built for Shreyas Thakur (Chemical Engineer & MBA Candidate at IIM Mumbai). Designed to highlight the transition from rigorous technical engineering to business leadership, strategy, and operations management.

## 🚀 Tech Stack

* **Vite 6** — Lightning-fast build tooling and dev server
* **Vanilla JS** — Zero-dependency architecture for maximum performance and control
* **Vanilla CSS** — Custom design system built with CSS variables (`design-tokens.css`)
* **PWA Enabled** — Fully installable as an application via `vite-plugin-pwa`
* **GitHub Actions** — CI/CD pipeline automating deployments to GitHub Pages

## 📐 Architecture & Design System

The application is structured as a modular SPA-like experience without heavy frameworks. 
All UI components are built natively and assembled in `src/main.js`.

* **Design Tokens:** Typography scales, colors, spacing, and animations defined centrally in `src/styles/design-tokens.css`.
* **DOM Utilities:** Custom wrapper functions in `src/utils/dom.js` for clean element creation.
* **Component-Based Sections:** Each major section (Hero, About, Experience) is a standalone pure function returning a DOM node.

## 🛠️ Local Development

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/ShreyasThakur11/ShreyasThakur11.github.io.git
   cd ShreyasThakur11.github.io
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`
   _The site will be available at http://localhost:5173_

### Building for Production

\`\`\`bash
npm run build
\`\`\`
_Compiled assets will be placed in the `dist/` directory._

## 📝 Formspree Integration

The Contact form is built to integrate directly with Formspree.
To activate it:
1. Create a Formspree account and a new form.
2. Open `src/sections/contact.js`.
3. Locate the form action URL: `https://formspree.io/f/YOUR_FORM_ID`.
4. Replace `YOUR_FORM_ID` with your actual Formspree ID.

## 🔮 Easter Eggs
* Press \`Cmd + K\` or \`Ctrl + K\` to quickly scroll to the Contact section.
* Check the developer console for a hidden message.

---
*Built with care.*
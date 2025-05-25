# PDF Unlocker

A secure web application to unlock password-protected PDF files. All processing happens in your browser for maximum privacy.

## 🚀 [Try it live](https://kstonekuan.github.io/pdf-unlocker/)

## Features

- **Smart Password Detection**: Automatically tries 24+ common passwords
- **Secure Processing**: All PDF unlocking happens locally in your browser
- **Multiple Files**: Upload and process multiple PDFs at once
- **AI Filename Suggestions**: Intelligent renaming based on content (full version only)
- **Preserves Original**: Unlocked PDFs keep original formatting and text

## Tech Stack

- Next.js + TypeScript
- PDF.js for PDF processing
- pdf-lib for PDF manipulation  
- Anthropic Claude AI (optional)

## Quick Start

```bash
git clone https://github.com/kstonekuan/pdf-unlocker.git
cd pdf-unlocker
pnpm install
pnpm dev
```

For AI features, add `ANTHROPIC_API_KEY=your_key` to `.env` file.

## Deployment

**Static (Recommended):**
```bash
pnpm run build:static  # No AI features, runs offline
```

**Full Version:**
```bash
pnpm build             # With AI features, needs server
```

Deploy static build to GitHub Pages, Netlify, or any web server.

## License

This project is licensed under the MIT License.

---

*This project was built with [Claude Code](https://www.anthropic.com/claude-code) - AI-powered coding assistant that helped design, implement, and deploy this entire application.*
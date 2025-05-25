# PDF Unlocker

A web application to unlock password-protected PDF files. Upload your PDFs, and the application will try to unlock them using common passwords before asking you to provide a specific password.

## Features

- Upload multiple PDF files at once
- Automatically try common passwords
- Download unlocked PDFs
- Intelligent filename suggestions using Claude AI
- Rename PDFs based on their content
- Modern, responsive UI
- PDF unlocking happens securely in your browser

## Technologies Used

- TypeScript
- Next.js for the frontend and API routes
- PDF.js for encrypted PDF handling and unlocking
- pdf-lib for PDF manipulation and creation
- Anthropic Claude AI for intelligent file analysis
- Biome for linting and formatting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended), npm, or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pdf-unlocker.git
cd pdf-unlocker
```

2. Install dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Create a `.env` file based on the `.env.example` file
```bash
cp .env.example .env
```

4. Add your Anthropic API key to the `.env` file:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

You can get an API key from [Anthropic's website](https://www.anthropic.com/)

5. Start the development server
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Building for Production

To build the application for production, run:

```bash
pnpm build
# or
npm run build
# or
yarn build
```

To start the production server:

```bash
pnpm start
# or
npm run start
# or
yarn start
```

## Intelligent Filename Suggestions

The PDF Unlocker app includes a powerful feature that uses Claude to analyze the content of your PDFs and suggest more meaningful filenames. This is especially useful when:

- Your PDFs have generic names like "document.pdf" or "scan_001.pdf"
- You've received PDFs with randomized names
- You're handling multiple similar documents and need better organization

The AI analyzes the PDF content to determine:
1. What the document is about
2. Key identifiers (dates, titles, report types)
3. If the existing name already properly describes the content

If the AI determines the current name is appropriate, it will keep it unchanged. Otherwise, it will suggest a more descriptive name that reflects the actual content.

This feature can be toggled on/off in the interface.

## How PDF Unlocking Works

The app uses **PDF.js** (Mozilla's JavaScript PDF library) to handle password-protected PDFs directly in your browser:

1. **Privacy First**: Your PDFs never leave your browser - all processing happens locally
2. **Common Passwords**: The app first tries 25+ common passwords automatically  
3. **Manual Entry**: If common passwords fail, you can enter the correct password
4. **Real Decryption**: Uses PDF.js to actually decrypt and unlock protected PDFs
5. **High Quality Output**: Converts unlocked PDFs to high-resolution images for maximum compatibility

### Technical Details

- **PDF.js Integration**: Full implementation with Web Worker support
- **Automatic Initialization**: PDF processor initializes on app startup
- **Error Handling**: Graceful fallbacks if PDF.js fails to load
- **Image Conversion**: Encrypted pages are converted to 2x resolution PNGs for clarity
- **Smart Scaling**: Pages are intelligently sized to standard paper dimensions

The unlocked PDFs maintain visual quality while being fully readable and printable.

## License

This project is licensed under the MIT License.
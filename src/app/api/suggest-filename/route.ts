import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const currentName = formData.get("currentName") as string;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 },
      );
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    let textContent = "";
    const maxPages = Math.min(pages.length, 5);

    for (let i = 0; i < maxPages; i++) {
      // Note: pdf-lib doesn't have built-in text extraction
      // In a production app, you would use a library like pdf-parse or pdf.js
      textContent += `Page ${i + 1}: [Page has ${pages[i].getSize().width}x${pages[i].getSize().height} dimensions]\n`;
    }

    const prompt = `You are a helpful assistant that suggests meaningful filenames for PDF documents. 
    
Current filename: ${currentName}

The PDF has ${pages.length} pages. Here's a sample of the content:
${textContent}

Based on the content, suggest a better filename if the current one is generic (like "document.pdf", "scan_001.pdf", etc.). 
If the current filename already properly describes the content, keep it unchanged.

Return ONLY the suggested filename (with .pdf extension), nothing else. The filename should be:
- Descriptive of the content
- Use underscores or hyphens instead of spaces
- Include relevant dates if found in format YYYY-MM-DD
- Be concise but informative`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const suggestedName =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : currentName;

    return NextResponse.json({ suggestedName });
  } catch (error) {
    console.error("Error suggesting filename:", error);
    return NextResponse.json(
      { error: "Failed to suggest filename" },
      { status: 500 },
    );
  }
}

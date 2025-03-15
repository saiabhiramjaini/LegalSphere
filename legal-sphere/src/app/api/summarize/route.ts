import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join(process.cwd(), "public", "uploads", "temp.txt");
    await writeFile(tempFilePath, buffer);

    // Read file content
    const fileContent = buffer.toString("utf-8");

    // Send to OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-exp-1206:free",
        messages: [
          { role: "user", content: `Summarize this legal document:\n\n${fileContent}` },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Delete temp file
    await unlink(tempFilePath);

    return NextResponse.json({ summary: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}

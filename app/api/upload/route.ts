import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure that the API key is always a string by providing a fallback
const apiKey = `${process.env.NEXT_PUBLIC_PINE_CONE_API_KEY}`;
const GEN_AI_API_KEY = `${process.env.NEXT_PUBLIC_GEN_AI_API_KEY}`;

const pinecone = new Pinecone({
  apiKey: apiKey, // This ensures that apiKey is always a string
});

const genAI = new GoogleGenerativeAI(GEN_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Function to generate embeddings for parsed resume text
const generateEmbedding = async (resumeText: string) => {
  try {
    // Generate embedding using Google Gemini embeddings API
    const result = await model.embedContent(resumeText);
    console.log("Generated Embedding:", result.embedding.values);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding with Gemini:", error);
    throw error;
  }
};

const extractMetaData = async (resumeText: string) => {
  try {
    // Define the prompt to ask Google Gemini to extract name, skills, and experience
    const prompt = `
      Extract the following details from the resume:
      - Name
      - Skills
      - Experience Note only return experience in years if there is no previous experience return as no experience check with completion of degree and state fresher or no experience
      Resume Text:
      ${resumeText}
    `;

    const model1 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use the correct method, e.g., 'predict' or 'generate', depending on the API
    const result = await model1.generateContent(prompt);

    // Log the full response to see the output from Gemini
    const generatedText = await result.response.text();
    console.log(generatedText); // Output the generated text

    // Process the completion to extract name, skills, and experience
    const name = generatedText.match(/Name:\s*(.+)/)?.[1];
    const skills = generatedText.match(/Skills:\s*(.+)/)?.[1]?.split(',').map((skill: string) => skill.trim()) || [];
    const experience = generatedText.match(/Experience:\s*(.+)/)?.[1];
  
    // Return the extracted metadata
    return { name, skills, experience };
  } catch (error) {
    console.error("Error extracting metadata with Gemini:", error);
    throw error;
  }
};

// Function to upsert resume embedding into Pinecone
const upsertResumeEmbeddingToPinecone = async (resumeText: string, email: FormDataEntryValue | null) => {
  try {
    // Step 1: Generate Embedding
    const embedding = await generateEmbedding(resumeText);

    const metadata = await extractMetaData(resumeText);
    // Step 2: Get Pinecone Index
    const pineconeIndex = pinecone.Index('skill-scan-index'); // Use your Pinecone index name

    const vector = {
      id: `resume-${Date.now()}`,
      values: embedding,
      metadata: {
        name: metadata.name || "unknown", 
        skills: metadata.skills || [], 
        experience: metadata.experience || "No experience", 
        email: typeof email === 'string' ? email : "no email", 
        resume: resumeText || "not defined",  
      },
    };

    // Step 4: Upsert the vector to Pinecone
    await pineconeIndex.upsert([vector]); // Pass the vector directly in an array

    console.log('Resume vector upserted to Pinecone successfully');
  } catch (error) {
    console.error('Error upserting resume to Pinecone:', error);
    throw error;
  }
};



// POST handler for both resume upload and candidate search
export async function POST(req: Request) {
  try {
    // Check if the request contains form data (resume upload case)
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('resume') as Blob | null;
      const email = formData.get('email');

      if (!file) {
        return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);

      const parsedResume = pdfData.text;

      // Upsert the parsed resume embedding to Pinecone
      await upsertResumeEmbeddingToPinecone(parsedResume, email);

      return NextResponse.json({ message: "File uploaded, parsed, and upserted successfully.", data: parsedResume });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    
    return NextResponse.json({
        message: "Failed to process request.",
        error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
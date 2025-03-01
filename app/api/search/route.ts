import { NextResponse } from "next/server";
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

interface ResumeText {
    email: string;
    contact: string;
    name: string;
    skills: string[];
    experience: string;
  }
  
  interface Feedback {
    feedback: string;
  }
  
  // Define the API response structure
  interface ApiResponse {
    feedback: Feedback;
    resumes: {
      resumeText: ResumeText;
    }[];
  }
async function searchResumes(query: string): Promise<{ resumeText: ResumeText }[]> {
    try {
      const queryEmbedding = await generateEmbedding(query);
  
      const index = pinecone.Index("skill-scan-index");
      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        throw new Error("Embedding generation failed or returned an invalid value.");
      }
  
      const searchResults = await index.query({
        vector: queryEmbedding as number[],
        topK: 5,
        includeValues: true,
        includeMetadata: true,
      });
  
      // Fix the TypeScript error by using proper types
      const resumes = searchResults.matches?.map((match) => {
        const metadata = match.metadata;
  
        // Check if metadata exists
        if (!metadata) {
          return {
            resumeText: {
              email: "Not Available",
              contact: "Not Available",
              name: "Not Available",
              skills: [],
              experience: "No experience"
            },
          };
        }
  
        // Cast RecordMetadata to ResumeText (ensure the structure matches)
        const resumeText: ResumeText = {
          email: String(metadata.email) || "Not Available",
          contact: String(metadata.contact || "Not Available"),
          name: String(metadata.name || "Not Available"),
          skills: Array.isArray(metadata.skills) ? metadata.skills : [],
          experience: String(metadata.experience || "No experience")
        };
  
        return { resumeText };
      }) || [];
  
      return resumes;
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw new Error('Failed to search resumes');
    }
  }
  
  const generateFeedback = async (query: string, resumes: { resumeText: ResumeText }[]): Promise<ApiResponse> => {
    try {
      // Placeholder feedback based on the query
      const feedbackMessage = `Based on your query for '${query}', here are the most relevant resumes.`;
  
      // Map the resumes data to match the structure required by the frontend
      const matchingResumes = resumes.map((resume) => {
        const metadata = resume.resumeText;
  
        if (!metadata) {
          console.error('Metadata is missing or undefined for this resume');
          return {
            resumeText: {
              name: 'Not Available',
              experience: 'Not Available',
              skills: [],
              email: 'Not Available',
              contact: 'Not Available'
            },
          };
        }
        return { resumeText: metadata };
      });
  
      // Create the final JSON response
      const response: ApiResponse = {
        feedback: {
          feedback: feedbackMessage,
        },
        resumes: matchingResumes,
      };
  
      return response;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw new Error('Failed to generate feedback');
    }
  };
  
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    // Perform candidate search
    const resumes = await searchResumes(query);
    // Generate feedback using Gemini
    const feedback = await generateFeedback(query, resumes);

    return NextResponse.json({ feedback, resumes });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return NextResponse.json({
        message: "Failed to process request.",
        error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
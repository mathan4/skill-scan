'use client';
import { useState } from 'react';
import axios from 'axios';


// Define the structure of the resume metadata
interface ResumeText {
  email: string;
  contact: string;
  name: string;
  skills: string[];
  experience: string;
}

interface feedback{
  feedback:string;
}
// Define the API response structure
interface ApiResponse {
  feedback: feedback;
  resumes: {
    resumeText: ResumeText;
  }[];
}

export default function CandidateSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post<ApiResponse>('/api/upload', { query });
      setResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
       <form 
        onSubmit={handleSubmit} 
        className="flex w-full max-w-md items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a skill or job title"
          className="w-full rounded-l-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <button 
          type="submit" 
          className="rounded-r-full bg-black px-6 py-2 text-white"
        >
          Search
        </button>
      </form>

      {results && (
        <div className="space-y-6 mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-bold">Generated Feedback</h2>
          <p className="text-gray-700">{typeof results.feedback.feedback === 'string' ? results.feedback.feedback : 'No feedback available'}</p>

          <h3 className="text-lg sm:text-xl font-semibold">Matching Resumes:</h3>
          {Array.isArray(results.resumes) && results.resumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {results.resumes.map((resume, index) => {
                const resumeText = resume.resumeText|| {}; // Safely access resumeText
                return (
                  <div key={index} className="w-full bg-white shadow-lg rounded-lg p-4 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">{resumeText.name || 'No name available'}</h4>
                    <p className="mt-2 text-sm sm:text-base text-gray-600"><strong>Experience:</strong> {resumeText.experience || 'No experience available'}</p>
                    <p className="mt-2 text-sm sm:text-base text-gray-600"><strong>Skills:</strong> {Array.isArray(resumeText.skills) ? resumeText.skills.join(', ') : 'No skills available'}</p>
                    <p className="mt-2 text-sm sm:text-base text-gray-600"><strong>Email:</strong>{resumeText.email}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No resumes found</p>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";

type FormData = {
  name: string;
  email: string;
  linkedIn: string;
  resume: File | null;
  skills: string;
};

export default function CandidateForm() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      linkedIn: "",
      skills: "",
      resume: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeFile(file ?? null);
    setValue("resume", file ?? null);
  };

  const onSubmit = async(data: FormData) => {
    if (!resumeFile) {
      console.log("Please upload a resume.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("linkedIn", data.linkedIn);
    formData.append("resume", resumeFile);
    formData.append("skills", data.skills);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Server response:", response.data);
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-4 sm:px-6 md:px-8 lg:px-20 xl:px-40 py-6 md:py-10 max-w-6xl mx-auto">
      <div>
        <label className="block mb-2 font-medium">Name</label>
        <Input
          placeholder="John Doe"
          {...register("name", { required: "Name is required", minLength: 2 })}
        />
        {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block mb-2 font-medium">Email</label>
        <Input
          placeholder="example@email.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: "Please enter a valid email address",
            },
          })}
        />
        {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>}
      </div>

      <div>
        <label className="block mb-2 font-medium">LinkedIn URL</label>
        <Input
          placeholder="https://linkedin.com/in/yourprofile"
          {...register("linkedIn", {
            required: "LinkedIn profile is required",
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/.*$/i,
              message: "Please enter a valid LinkedIn URL",
            },
          })}
        />
        {errors.linkedIn && <span className="text-red-500 text-sm mt-1 block">{errors.linkedIn.message}</span>}
      </div>

      <div>
        <label className="block mb-2 font-medium">Resume (PDF)</label>
        <Input type="file" accept=".pdf" onChange={handleFileChange} />
        {errors.resume && <span className="text-red-500 text-sm mt-1 block">{errors.resume.message}</span>}
      </div>

      <div>
        <label className="block mb-2 font-medium">Skills & Experience</label>
        <Textarea
          placeholder="Describe your skills and experience"
          {...register("skills", {
            required: "Skills are required",
            minLength: {
              value: 10,
              message: "Skills and experience should be descriptive.",
            },
          })}
          className="min-h-32"
        />
        {errors.skills && <span className="text-red-500 text-sm mt-1 block">{errors.skills.message}</span>}
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full sm:w-auto">Submit Application</Button>
      </div>
    </form>
  );
}
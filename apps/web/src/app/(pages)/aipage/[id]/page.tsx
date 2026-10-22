'use client';
import { getExerciseById } from "@/app/repositories/exercise.repository";
import AIReviewButton from "@/components/AiReview";
import { notFound } from "next/navigation";
import { useState } from "react";


export default async function AiTestPage({params}:{params: Promise<{ id: string }>}) {
  const [code, setCode] = useState("")
  const { id } = await params
  const exerciseId = Number(id)
  if (!Number.isInteger(exerciseId)) notFound()
  const exercise = await getExerciseById(exerciseId)
  if (!exercise) notFound()

  

  return (
    <div>
      <input type="text" value={code} onChange={(e)=>setCode(e.target.value)}/>
      <AIReviewButton code="" exerciseId={0}/>
    </div>
  );
}
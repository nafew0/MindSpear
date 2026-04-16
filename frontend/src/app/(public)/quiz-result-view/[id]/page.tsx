/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import QuizMode from '@/components/Dashboard/QuizMode';
import React from 'react'

function QuizResultView() {
  return (
    <div>
      <QuizMode scope={"entire"} sessionData="" />
    </div>
  )
}

export default QuizResultView;

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import SingleResultView from "@/components/ResultComponent/SingleResultView";
import { toast } from "react-toastify";

export type Submission = {
  id: number;
  participant_id: number | null;
  task_id: number;
  status: string;
  completed_at: string | null;
  completion_data: CompletionData;
  created_at: string;
  updated_at: string;
  task: Task;
};

type CompletionData = {
  start_time?: string;
  selected_option?: number | number[] | string[];
};

type Task = {
  id: number;
  quest_id: number;
  title: string;
  description: string | null;
  task_type:
    | "single_choice"
    | "multiple_choice"
    | "truefalse"
    | "fill_in_the_blanks_choice"
    | "sorting"
    | "scales"
    | "ranking"
    | "wordcloud"
    | "longanswer"
    | "shortanswer"
    | string;
  serial_number: number;
  task_data: TaskData;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

type TaskData = {
  questions: Question[];
  time_limit?: number;
  time_limit_seconds?: number;
};

type Question = { id: number; text: string; color?: string };

// API Call Component
export default function ResultShowModal({attemId} : any) {
  const [resultList, setResultList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  console.log(resultList, "resultListresultListresultListresultListresultList");
  


  useEffect(() => {
    const dataFetch = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/quest-attempts/${attemId}`
        );
        setResultList(
          response?.data?.data?.attempt?.task_completions ?? []
        );
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response) {
          console.error("Fetch error:", axiosError.response.data);
          toast.error(
            `Error: ${
              axiosError.response.data?.message ||
              "Failed to fetch."
            }`
          );
        } else {
          console.error("Unexpected error:", axiosError.message);
          toast.error("Unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    dataFetch();
  }, [attemId]);

  return <SingleResultView resultList={resultList} loading={loading} />;
}




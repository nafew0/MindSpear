'use client';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import QuizCreatorPreview from '@/components/Dashboard/CreateQuiz/QuizCreatorPreview';
import TrueFalseCreatorPreview from '@/components/Dashboard/CreateQuiz/TrueFalseCreatorPreview';
import SortAnswerCreatorPreview from '@/components/Dashboard/CreateQuiz/SortAnswerCreatorPreview';
import FillInTheBlanksCreatorPreview from '@/components/Dashboard/CreateQuiz/FillInTheBlanksCreatorPreview';
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from 'axios';
import { useParams } from "next/navigation";
import { setQuiz } from "@/features/quiz/store/quizInformationSlice";
import type { Quiz } from "@/types/types";
import { PiWarningCircle } from 'react-icons/pi';
import { transformQuestionData } from '@/utils/quizUtils';
import { setMultipleSelectedItems } from '@/features/quiz/store/quizItems/quizSlice';
import { toast } from 'react-toastify';

interface QuizItem {
  key: string;
  id: string;
}

interface QuizApiResponse {
  data: Quiz;
}

function QuizCreator() {
  const params = useParams();
  const dispatch = useDispatch();
  const hoveredItem = useSelector((state: RootState) => state.quiz.hoveredItem);
  const selectedItem = useSelector((state: RootState) => state.quiz.selectedItem);
  const renderPreview = (item: QuizItem | null) => {
    if (!item) return <h3>Coming Soon</h3>;
    switch (item.key) {
      case 'quiz':
        return <QuizCreatorPreview id={item.id} />;
      case 'truefalse':
        return <TrueFalseCreatorPreview id={item.id} />;
      case 'sortanswer':
        return <SortAnswerCreatorPreview id={item.id} />;
      case 'fillintheblanks':
        return <FillInTheBlanksCreatorPreview id={item.id} />;
      default:
        return <div className='h-screen bg-[#fff] rounded-[10px] flex flex-col justify-center items-center'>
          <PiWarningCircle className="text-[60px] text-[#fda14d]" />
          <h3 className="font-bold text-[#333] pt-[15px]">
            Please create you question
          </h3>
        </div>;
    }
  };

  const activeItem = hoveredItem ?? selectedItem;

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await axiosInstance.get<QuizApiResponse>(`/quizes/show/${params?.quizId}`);
        console.log(response?.data?.data?.quiz?.questions, "response?.data?.data");
        const transformedData = transformQuestionData(response?.data?.data?.quiz?.questions);
        console.log(transformedData, "response?.data?.data");
        dispatch(setMultipleSelectedItems(transformedData));

        dispatch(setQuiz(response?.data?.data));



      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        if (axiosError.response) {
          console.error('Error verifying token:', axiosError.response.data);
          toast.error(`Error: ${axiosError.response.data?.message || 'Verification failed.'}`);
        } else {
          console.error('Unexpected error:', axiosError.message);
          toast.error('Unexpected error occurred. Please try again.');
        }
      } finally {

      }
    }
    dataFetch()
  }, [params?.quizId, dispatch])
  return (
    <div>
      {renderPreview(activeItem)}
    </div>
  )
}

export default QuizCreator

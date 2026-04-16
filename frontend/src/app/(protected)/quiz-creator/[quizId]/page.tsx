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
import { setQuiz } from "@/stores/features/quizInformationSlice";
import type { Quiz } from "@/types/types";
import PdfModal from '@/components/Dashboard/PdfQuiz/PdfModal';
import { toast } from 'react-toastify';


interface QuizItem {
  key: string;
  id: string;
}

interface QuizApiResponse {
  data: Quiz;
}

interface QuizState {
  qseaneType: string,
  quiz: Quiz;
}
interface QuizInformationProps {
  quizInformation: {
    quizInformation: QuizState;
  };
}

function QuizCreator() {
  const params = useParams();
  const dispatch = useDispatch();
  const quizData = useSelector(
    (state: QuizInformationProps) => state.quizInformation.quizInformation
  );
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
        return <h3>Coming Soon</h3>;
    }
  };

  const activeItem = hoveredItem ?? selectedItem;

  console.log(quizData, "selectedItem");

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await axiosInstance.get<QuizApiResponse>(`/quizes/show/${params?.quizId}`);
        const quizDataWithType = { ...response?.data?.data, qseaneType: `${quizData?.qseaneType}`, };
        dispatch(setQuiz(quizDataWithType));

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
      {quizData?.qseaneType === "pdf" && quizData?.quiz.questions?.length === 0 && (
        <PdfModal />
      )}

      {renderPreview(activeItem)}
    </div>
  )
}

export default QuizCreator

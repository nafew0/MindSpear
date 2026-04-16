'use client';
import React, { useState, useEffect, useCallback } from 'react';
import QuizComponent from '../QuizComponent';
import TrueFalseComponent from '../TrueFalseComponent';
import { QuizData, QuizQuestion } from '@/types/public';
import axiosInstance from '@/utils/axiosInstance';
import { useParams } from 'next/navigation';
import { transformQuestionData } from '@/utils/quizUtils';
import FillInTheBlanksComponent from '../FillInTheBlanksComponent';
import SortAnswerBlanksComponent from '../SortAnswerBlanksComponent';

const QuizPlayPage = () => {
  const params = useParams();
  const [quizData, setQuizData] = useState<QuizData>({
    quiztime: "1m",
    quiztimeStatus: false,
    questions: []
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);
const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});


  const parseTime = useCallback((timeString: string) => {
    const minutes = parseInt(timeString.replace('m', ''));
    return minutes * 60;
  }, []);

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const responselist = await axiosInstance.get(`/quizes/show/${params.id}`);
        // console.log(responselist, "responselistresponselistresponselist");
        
        const datalist = await transformQuestionData(responselist?.data?.data?.quiz?.questions);
        console.log(datalist, "responselistresponselistresponselist");

        const apiQuizData: QuizData = {
          quiztime: responselist?.data?.data?.quiz?.timeLimit || "100m",
          quiztimeStatus: responselist?.data?.data?.quiz?.hasTimeLimit || false,
          questions: datalist.map((question) => ({
            ...question,
            timeLimit: question.timeLimit || "30",
            options: question.options.map((option) => ({
              id: option.id,
              text: option.text,
              placeholder: option.placeholder ?? "",
              color: option.color ?? "#000000",
              isSelected: false,
              label: option?.text,
            })),
          })),
        };
        
        setQuizData(apiQuizData);
        setQuestions(apiQuizData.questions);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    dataFetch();
  }, [params.id]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const hasSelection = currentQuestion.options.some(option => option.isSelected);
      setHasSelectedAnswer(hasSelection);
    }
  }, [questions, currentQuestionIndex]);

  // Initialize timers based on quiz mode
  useEffect(() => {
    if (questions.length === 0) return;

    if (quizData.quiztimeStatus) {
      // Quiz-level timer mode
      setTotalTimeLeft(parseTime(quizData.quiztime));
    } else {
      // Question-level timer mode - use current question's time limit
      const currentTime = parseInt(questions[currentQuestionIndex]?.timeLimit || '0');
      setQuestionTimeLeft(currentTime);
    }
    setIsDisabled(false);
  }, [quizData.quiztimeStatus, quizData.quiztime, questions.length, currentQuestionIndex, parseTime]);

  // Quiz-level timer effect
  useEffect(() => {
    if (!quizData.quiztimeStatus || quizCompleted) return;

    const timer = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          completeQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData.quiztimeStatus, quizCompleted]);

  // Question-level timer effect
useEffect(() => {
  if (quizData.quiztimeStatus || quizCompleted || questions.length === 0) return;

  // Initialize or use remaining time for current question
  const initialTime = questionTimes[currentQuestionIndex] ?? parseInt(questions[currentQuestionIndex]?.timeLimit || '0');
  setQuestionTimeLeft(initialTime);

  const questionTimer = setInterval(() => {
    setQuestionTimeLeft(prev => {
      if (prev <= 1) {
        if (!answeredQuestions.includes(currentQuestionIndex)) {
          setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
        }
        
        if (currentQuestionIndex < questions.length - 1) {
          setTimeout(() => {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setHasSelectedAnswer(false);
          }, 1000);
        } else {
          completeQuiz();
        }
        return 0;
      }
      
      // Update the remaining time for this question
      const newTime = prev - 1;
      setQuestionTimes(prevTimes => ({
        ...prevTimes,
        [currentQuestionIndex]: newTime
      }));
      
      return newTime;
    });
  }, 1000);

  return () => clearInterval(questionTimer);
}, [currentQuestionIndex, quizData.quiztimeStatus, quizCompleted, questions.length, answeredQuestions]);


// Modify handleNextQuestion and handlePreviousQuestion to preserve timer state
const handleNextQuestion = () => {
  if (currentQuestionIndex < questions.length - 1) {
    if (!quizData.quiztimeStatus && !answeredQuestions.includes(currentQuestionIndex)) {
      setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
    }
    setCurrentQuestionIndex(prev => prev + 1);
    setHasSelectedAnswer(false);
  } else {
    completeQuiz();
  }
};

const handlePreviousQuestion = () => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex(prev => prev - 1);
    const prevQuestion = questions[currentQuestionIndex - 1];
    const wasAnswered = prevQuestion.options.some(opt => opt.isSelected);
    setHasSelectedAnswer(wasAnswered);
  }
};


  const completeQuiz = useCallback(() => {
    setQuizCompleted(true);
    setIsDisabled(true);
  }, []);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (quizCompleted) return;

    setQuestions(prev =>
      prev.map(question => {
        if (question.id !== questionId) return question;

        const updatedOptions = question.options.map(option => {
          if (!question.isMultipleSelection) {
            return { ...option, isSelected: option.id === optionId };
          }
          return option.id === optionId
            ? { ...option, isSelected: !option.isSelected }
            : option;
        });

        const hasSelection = updatedOptions.some(opt => opt.isSelected);
        setHasSelectedAnswer(hasSelection);

        if (!quizData.quiztimeStatus && !answeredQuestions.includes(currentQuestionIndex)) {
          setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
        }

        return { ...question, options: updatedOptions };
      })
    );
  };



  const currentQuestion = questions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">
          {quizData.quiztimeStatus ? 'Quiz Completed!' : 'Your Quiz Time is Complete!'}
        </h1>
        <p>Thank you for taking the quiz.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Quiz...</h1>
      </div>
    );
  }

  console.log(currentQuestion, "currentQuestioncurrentQuestion");
  

  return (
    <div className="  quiz_play_bg  w-full bg-[#fff]">
      <div className="w-full mb-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {Array.from({ length: questions.length }).map((_, index) => (
            <div
              key={index}
              className={`
                w-full h-4 border rounded flex items-center justify-center text-sm
                ${
                  index < currentQuestionIndex || answeredQuestions.includes(index)
                    ? 'bg-primary text-white border-primary' 
                    : index === currentQuestionIndex
                    ? 'bg-primary border-primary text-white font-bold' 
                    : 'bg-gray-100 border-gray-300'
                }
              `}
            >
              {/* {index + 1} */}
            </div>
          ))}
        </div>
      </div>
      <div className='p-4'>
        {currentQuestion.key === 'quiz' && (
          <QuizComponent
            question={currentQuestion}
            onOptionSelect={(optionId) => handleOptionSelect(currentQuestion.id, optionId)}
            disabled={isDisabled || (!quizData.quiztimeStatus && questionTimeLeft <= 0)}
            timeLeft={quizData.quiztimeStatus ? totalTimeLeft : questionTimeLeft}
          />
        )}
        {currentQuestion.key === 'truefalse' && (
          <TrueFalseComponent
            question={currentQuestion}
            onOptionSelect={(optionId) => handleOptionSelect(currentQuestion.id, optionId)}
            disabled={isDisabled || (!quizData.quiztimeStatus && questionTimeLeft <= 0)}
          />
        )}

        {currentQuestion.key === 'fillintheblanks' && (
          <FillInTheBlanksComponent
            question={currentQuestion}
            onOptionSelect={(optionId) => handleOptionSelect(currentQuestion.id, optionId)}
            disabled={isDisabled || (!quizData.quiztimeStatus && questionTimeLeft <= 0)}
            timeLeft={quizData.quiztimeStatus ? totalTimeLeft : questionTimeLeft}
          />
        )}

        {currentQuestion.key === 'sortanswer' && (
          <SortAnswerBlanksComponent
            question={currentQuestion}
            onOptionSelect={(optionId) => handleOptionSelect(currentQuestion.id, optionId)}
            disabled={isDisabled || (!quizData.quiztimeStatus && questionTimeLeft <= 0)}
            timeLeft={quizData.quiztimeStatus ? totalTimeLeft : questionTimeLeft}
            onAnswerChange={(hasAnswer) => setHasSelectedAnswer(hasAnswer)}
          />
        )}

        <div className="flex justify-between ">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`bg-gray-500 text-white font-bold py-2 px-4 rounded ${
              currentQuestionIndex === 0
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-700'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!hasSelectedAnswer}
            className={`bg-purple-600 text-white font-bold py-2 px-4 rounded ${
              !hasSelectedAnswer
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-purple-700'
            }`}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayPage;
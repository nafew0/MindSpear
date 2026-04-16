/* eslint-disable @typescript-eslint/no-explicit-any */

import axiosInstance from "@/utils/axiosInstance";

export interface SurveyPage {
	id: number;
	survey_id: number;
	page_number: number;
	title: string;
	description?: string;
	has_conditional_logic: boolean;
	created_at: string;
	updated_at: string;
	question_count?: number;
}

export interface SurveyQuestion {
	id: number;
	survey_id: number;
	page_id: number;
	question_text: string;
	question_type: string;
	serial_number: number;
	is_required: boolean;
	metadata?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

/******************************************
 *	Survey Services
 *******************************************/
export const createSurvey = (surveyData: any) =>
	axiosInstance.post(`/surveys/store`, surveyData);

export const getSurveyDetailsById = (surveyId: number | string) =>
	axiosInstance.get(`/surveys/show/${surveyId}`);

export const deleteSurveyById = (surveyId: number | string) =>
	axiosInstance.delete(`/surveys/delete/${surveyId}`);

/******************************************
 *	Survey Page Services
 *******************************************/

export const getPagesBySurveyId = (surveyId: number | string) =>
	axiosInstance.get(`/surveys/show/${surveyId}`);

export const createSurveyPage = (pageData: any) =>
	axiosInstance.post(`/survey-pages/store`, pageData);

export const updateSurveyPage = (pageId: number | string, pageData: any) =>
	axiosInstance.post(`/survey-pages/update/${pageId}`, pageData);

export const deleteSurveyPage = (pageId: number | string) =>
	axiosInstance.delete(`/survey-pages/delete/${pageId}`);

/******************************************
 * Survey Question Services
 *******************************************/

export interface SurveyQuestionRequest {
  survey_id: number;
  page_id?: number;
  serial_number: number;
  question_text: string;
  question_type: string;
  options?: any[];
  is_required: boolean;
  has_conditional_logic: boolean;
  conditional_parent_type: string | null;
  conditional_question_id: number | null;
  conditional_page_id: number | null;
  conditional_value: string | null;
  conditional_operator: string;
  display_type: string;
  display_conditions: any | null;
}

export interface SurveyQuestionResponse {
  id: number;
  survey_id: number;
  page_id: number;
  serial_number: number;
  question_text: string;
  question_type: string;
  options: any[];
  is_required: boolean;
  has_conditional_logic: boolean;
  conditional_parent_type: string | null;
  conditional_question_id: number | null;
  conditional_page_id: number | null;
  conditional_value: string | null;
  conditional_operator: string;
  display_type: string;
  display_conditions: any | null;
  created_at: string;
  updated_at: string;
}

export const createSurveyQuestion = (questionData: SurveyQuestionRequest) =>
  axiosInstance.post(`/survey-questions/store`, questionData);

export const getSurveyQuestionById = (questionId: number | string) =>
  axiosInstance.get(`/survey-questions/show/${questionId}`);

export const updateSurveyQuestion = (questionId: number | string, questionData: SurveyQuestionRequest) =>
  axiosInstance.post(`/survey-questions/update/${questionId}`, questionData);

export const deleteSurveyQuestion = (questionId: number | string) =>
  axiosInstance.delete(`/survey-questions/delete/${questionId}`);

export const getAllSurveyQuestions = (surveyId: number | string) =>
  axiosInstance.get(`/survey-questions/survey/${surveyId}`);

export const getSurveyQuestionsByPage = (pageId: number | string) =>
  axiosInstance.get(`/survey-questions/page/${pageId}`);

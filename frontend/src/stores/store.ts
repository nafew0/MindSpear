// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "@/features/auth/store/authSlice";
import dropdownReducer from "@/features/dashboard/store/dropdownSlice";
import contentEditorReducer from "@/features/dashboard/store/contentEditorSlice";
import questionBankReducer from "@/features/dashboard/question-bank/store/questionBankSlice";
import leaderboardReducer from "@/features/live/store/leaderboardSlice";
import answersReducer from "@/features/live/store/leaderboardAnswersSlice";
import quickForm from "@/features/live/store/quickFormSlice";
import questInformationReducer from "@/features/quest/store/questInformationSlice";
import questQuestionTimeReducer from "@/features/quest/store/questQuestionTimeSlice";
import questSessionReducer from "@/features/quest/store/questSessionSlice";
import quizInformationReducer from "@/features/quiz/store/quizInformationSlice";
import quizReducer from "@/features/quiz/store/quizItems/quizSlice";
import activeSurveyPageReducer from "@/features/survey/store/activeSurveyPageSlice";
import surveyInformationReducer from "@/features/survey/store/surveyInformationSlice";
import surveyQuestionsReducer from "@/features/survey/store/surveyQuestionsSlice";
import surveyReducer from "@/features/survey/store/surveySlice";

const persistConfig = {
	key: "root",
	storage,
	whitelist: [
		"quiz",
		"survey",
		"questTime",
		"questSession",
		"quickForm",
		"questInformation",
		"surveyInformation",
		"quizInformation",
		"dropdown",
		"auth",
		"contentEditor",
		"leaderboard",
		"surveyQuestions",
		"activeSurveyPage",
	],
};

const rootReducer = combineReducers({
	auth: authReducer,
	dropdown: dropdownReducer,
	quiz: quizReducer,
	survey: surveyReducer,
	quizInformation: quizInformationReducer,
	questInformation: questInformationReducer,
	surveyInformation: surveyInformationReducer,
	leaderboard: leaderboardReducer,
	answers: answersReducer,
	quickForm: quickForm,
	questSession: questSessionReducer,
	questTime: questQuestionTimeReducer,
	contentEditor: contentEditorReducer,
	questionBank: questionBankReducer,
	surveyQuestions: surveyQuestionsReducer,
	activeSurveyPage: activeSurveyPageReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

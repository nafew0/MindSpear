// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "./features/authSlice";
import dropdownReducer from "./features/dropdownSlice";
import quizReducer from "./features/quizItems/quizSlice";
import quizInformationReducer from "./features/quizInformationSlice";
import questInformationReducer from "./features/questInformationSlice";
import surveyInformationReducer from "./survey/surveyInformationSlice";
import leaderboardReducer from "./features/leaderboardSlice";
import answersReducer from "./features/leaderboardAnswersSlice";
import questSessionReducer from "./features/questSessionSlice";
import questQuestionTimeReducer from "./features/questQuestionTimeSlice";
import contentEditorReducer from "./features/contentEditorSlice";
import questionBankReducer from "./features/questionBank/questionBankSlice";
import surveyQuestionsReducer from "./survey/surveyQuestionsSlice";
import activeSurveyPageReducer from "./survey/activeSurveyPageSlice";
import surveyReducer from "./survey/surveySlice";

// import quickFormReducer from "./features/quickForm.slice";
import quickForm from "./features/quickFormSlice";
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

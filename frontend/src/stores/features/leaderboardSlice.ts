/* eslint-disable @typescript-eslint/no-explicit-any */
// leaderboardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LeaderboardState {
	scope: "entire" | "slide";
	showLeaderboard: boolean;
	currentSlideIndex: number;
	totalSlides: number;
	lastSlideReached: boolean;
	leaderboard_slider: boolean;
	currentQsentId: string | any;
}

// Helper function to check if current route is qst-reports/id
const isQstReportsRoute = (): boolean => {
	if (typeof window === "undefined") return false;

	const path = window.location.pathname;
	// Check if route matches pattern /qst-reports/ followed by an ID
	return /^\quests-session\/[^/]+$/.test(path);
};

const isMyLibraryQuizRoute = (): boolean => {
	if (typeof window === "undefined") return false;

	const path = window.location.pathname;
	//console.log("Current Path:", path); // Debug log to check the path
	return /^\/my-library\/quiz\/[^/]+$/.test(path);
};

// Load initial state from localStorage if available
const loadInitialState = (): LeaderboardState => {
	if (typeof window === "undefined") {
		return {
			scope: "entire",
			showLeaderboard: false,
			currentSlideIndex: 0,
			totalSlides: 0,
			lastSlideReached: false,
			leaderboard_slider: false,
			currentQsentId: null,
		};
	}

	const savedState = localStorage.getItem("leaderboardState");
	if (isMyLibraryQuizRoute()) {
		return {
			scope: "entire",
			showLeaderboard: false,
			currentSlideIndex: 0,
			totalSlides: 0,
			lastSlideReached: false,
			leaderboard_slider: false,
			currentQsentId: null,
		};
	}

	if (savedState) {
		try {
			const parsed = JSON.parse(savedState);
			// Preserve the exact state including leaderboard state on reload
			return {
				scope: parsed.scope || "entire",
				showLeaderboard: parsed.showLeaderboard || false,
				currentSlideIndex: parsed.currentSlideIndex || 0,
				totalSlides: parsed.totalSlides || 0,
				lastSlideReached: parsed.lastSlideReached || false,
				leaderboard_slider: false,
				currentQsentId: parsed.currentQsentId,
			};
		} catch (error) {
			console.error("Error loading saved leaderboard state:", error);
		}
	}

	return {
		scope: "entire",
		showLeaderboard: false,
		currentSlideIndex: 0,
		totalSlides: 0,
		lastSlideReached: false,
		leaderboard_slider: false,
		currentQsentId: null,
	};
};

const initialState: LeaderboardState = loadInitialState();

// Save state to localStorage
const saveStateToStorage = (state: LeaderboardState) => {
	if (typeof window !== "undefined" && !isQstReportsRoute()) {
		localStorage.setItem(
			"leaderboardState",
			JSON.stringify({
				scope: state.scope,
				showLeaderboard: state.showLeaderboard,
				currentSlideIndex: state.currentSlideIndex,
				totalSlides: state.totalSlides,
				lastSlideReached: state.lastSlideReached,
				// leaderboard_slider: state.leaderboard_slider,
				leaderboard_slider: isMyLibraryQuizRoute()
					? false
					: state.leaderboard_slider,
			})
		);
	}
};

// Clear all cached data (manual call only)
export const clearLeaderboardCache = () => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("leaderboardState");
		sessionStorage.removeItem("leaderboardState");
		// Clear other app cache if needed
		localStorage.removeItem("otherCacheKey");
		sessionStorage.clear();
	}
};

export const leaderboardSlice = createSlice({
	name: "leaderboard",
	initialState,
	reducers: {
		setScope: (state, action: PayloadAction<"entire" | "slide">) => {
			console.log(action.payload, "9999");

			state.scope = action.payload;
			state.showLeaderboard = false;
			saveStateToStorage(state);
		},
		userQuizCompletedLastSlider: (state) => {
			state.showLeaderboard = false;
			state.currentSlideIndex = 0;
			state.totalSlides = 0;
			state.lastSlideReached = false;
			state.leaderboard_slider = false;
			saveStateToStorage(state);
		},
		setCurrentQsentId: (state, action: PayloadAction<string | null>) => {
			state.currentQsentId = action.payload;
			saveStateToStorage(state);
		},
		setTotalSlides: (state, action: PayloadAction<number>) => {
			console.log(state.scope, "2222222");

			state.totalSlides = Math.max(0, action.payload);
			// Don't reset currentSlideIndex if we're reloading and want to keep position
			if (state.currentSlideIndex >= state.totalSlides) {
				state.currentSlideIndex = Math.max(0, state.totalSlides);
			}
			state.lastSlideReached =
				state.currentSlideIndex === state.totalSlides;
			state.showLeaderboard =
				state.currentSlideIndex === state.totalSlides;
			if (isMyLibraryQuizRoute()) {
				state.leaderboard_slider = false;
			}
			saveStateToStorage(state);
		},
		setCurrentSlideIndex: (state, action: PayloadAction<number>) => {
			const idx = Math.min(
				Math.max(0, action.payload),
				Math.max(0, state.totalSlides)
			);
			state.currentSlideIndex = idx;
			state.lastSlideReached = idx === state.totalSlides;
			state.showLeaderboard = idx === state.totalSlides;
			saveStateToStorage(state);
		},
		// nextSlide: (state) => {
		// 	if (state.showLeaderboard) {
		// 		// When navigating from leaderboard, clear cache and reset
		// 		clearLeaderboardCache();
		// 		state.showLeaderboard = false;
		// 		state.leaderboard_slider = false;

		// 		if (state.scope === "slide") {
		// 			state.currentSlideIndex = Math.min(
		// 				state.currentSlideIndex + 1,
		// 				state.totalSlides - 1
		// 			);
		// 			state.lastSlideReached =
		// 				state.currentSlideIndex === state.totalSlides - 1;
		// 		} else {
		// 			state.currentSlideIndex = 0;
		// 			state.lastSlideReached = false;
		// 		}
		// 	} else {
		// 		const newIndex = state.currentSlideIndex + 1;
		// 		const isLastSlide = newIndex === state.totalSlides;

		// 		if (state.scope === "slide") {
		// 			state.showLeaderboard = true;
		// 			state.leaderboard_slider = true;
		// 			saveStateToStorage(state);
		// 			return;
		// 		}

		// 		if (isLastSlide) {
		// 			// Reached the end, show leaderboard but DON'T clear cache yet
		// 			state.currentSlideIndex = newIndex;
		// 			state.lastSlideReached = true;
		// 			state.showLeaderboard = true;
		// 			state.leaderboard_slider = true;
		// 			// Cache will be preserved for reload
		// 		} else {
		// 			// Normal next slide
		// 			state.currentSlideIndex = Math.min(
		// 				newIndex,
		// 				Math.max(0, state.totalSlides - 1)
		// 			);
		// 			state.lastSlideReached = false;
		// 			state.showLeaderboard = false;
		// 			state.leaderboard_slider = false;
		// 		}
		// 	}
		// 	saveStateToStorage(state);
		// 	return;
		// },
		nextSlide: (state) => {
			// ✅ END হলে আর slide change হবে না
			if (state.showLeaderboard && state.lastSlideReached) {
				return;
			}

			if (state.showLeaderboard) {
				clearLeaderboardCache();
				state.showLeaderboard = false;
				state.leaderboard_slider = false;

				if (state.scope === "slide") {
					state.currentSlideIndex = Math.min(
						state.currentSlideIndex + 1,
						state.totalSlides - 1
					);
					state.lastSlideReached =
						state.currentSlideIndex === state.totalSlides - 1;
				} else {
					state.currentSlideIndex = 0;
					state.lastSlideReached = false;
				}
			} else {
				const newIndex = state.currentSlideIndex + 1;
				const isLastSlide = newIndex === state.totalSlides;

				if (state.scope === "slide") {
					state.showLeaderboard = true;
					state.leaderboard_slider = true;
					saveStateToStorage(state);
					return;
				}

				if (isLastSlide) {
					state.currentSlideIndex = newIndex;
					state.lastSlideReached = true;
					state.showLeaderboard = true;
					state.leaderboard_slider = true;
				} else {
					state.currentSlideIndex = Math.min(
						newIndex,
						state.totalSlides - 1
					);
					state.lastSlideReached = false;
					state.showLeaderboard = false;
					state.leaderboard_slider = false;
				}
			}

			saveStateToStorage(state);
		},

		prevSlide: (state) => {
			if (state.showLeaderboard) {
				// Going back from leaderboard to last slide - clear cache now
				clearLeaderboardCache();
				state.showLeaderboard = false;
				state.lastSlideReached = false;
				state.currentSlideIndex = Math.max(0, state.totalSlides - 1);
			} else {
				const newIndex = state.currentSlideIndex - 1;
				state.currentSlideIndex = Math.max(0, newIndex);
				state.lastSlideReached = false;
				state.showLeaderboard = false;
			}
			saveStateToStorage(state);
		},
		resetLeaderboard: (state) => {
			state.showLeaderboard = false;
			state.currentSlideIndex = 0;
			state.lastSlideReached = false;
			saveStateToStorage(state);
		},
		// Manual cache clearing - call this on "result view" button click
		clearCache: (state) => {
			clearLeaderboardCache();
			// Optionally reset state or keep it as is
			state.currentSlideIndex = 0;
			state.showLeaderboard = false;
			state.lastSlideReached = false;
			saveStateToStorage(state);
		},
		// Action to manually show leaderboard without clearing cache
		showLeaderboardNow: (state) => {
			state.showLeaderboard = true;
			state.lastSlideReached = true;
			state.currentSlideIndex = state.totalSlides;
			saveStateToStorage(state);
		},
		// Action to reset everything including cache (for new session)
		resetEverything: (state) => {
			clearLeaderboardCache();
			state.scope = "entire";
			state.showLeaderboard = false;
			state.currentSlideIndex = 0;
			state.totalSlides = 0;
			state.lastSlideReached = false;
			saveStateToStorage(state);
		},
		forceEndLive: (state) => {
			state.lastSlideReached = true;
			state.leaderboard_slider = true;
			state.showLeaderboard = true;
			state.currentSlideIndex = state.totalSlides;
		},
	},
});

export const {
	setScope,
	setTotalSlides,
	setCurrentSlideIndex,
	nextSlide,
	prevSlide,
	resetLeaderboard,
	clearCache,
	showLeaderboardNow,
	resetEverything,
	userQuizCompletedLastSlider,
	forceEndLive,
	setCurrentQsentId,
} = leaderboardSlice.actions;
export default leaderboardSlice.reducer;

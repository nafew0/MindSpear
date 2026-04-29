"use client";

const QUEST_HOST_MUSIC_SRC = "/audio/quest-host-bg.mp3";
const QUEST_COUNTDOWN_BEEP_SRC = "/audio/countdown-beep.mp3";

const ARMED_KEY = "mindspear:quest-host-audio:armed";
const VOLUME_KEY = "mindspear:quest-host-audio:volume";

type AudioListener = () => void;

let bgMusic: HTMLAudioElement | null = null;
let countdownAudio: HTMLAudioElement | null = null;
let userVolume = 1;
let isDucked = false;
const listeners = new Set<AudioListener>();

const canUseAudio = () => typeof window !== "undefined";

const clampVolume = (value: number) => {
	if (!Number.isFinite(value)) return 1;
	return Math.min(1, Math.max(0, value));
};

const readStoredVolume = () => {
	if (!canUseAudio()) return 1;
	const stored = window.localStorage.getItem(VOLUME_KEY);
	return stored === null ? 1 : clampVolume(Number(stored));
};

const emit = () => {
	listeners.forEach((listener) => listener());
};

const effectiveVolume = () => userVolume * (isDucked ? 0.2 : 1);

const applyBackgroundVolume = () => {
	if (!bgMusic) return;
	bgMusic.volume = clampVolume(effectiveVolume());
};

const ensureBackgroundMusic = () => {
	if (!canUseAudio()) return null;

	userVolume = readStoredVolume();

	if (!bgMusic) {
		bgMusic = new Audio(QUEST_HOST_MUSIC_SRC);
		bgMusic.loop = true;
		bgMusic.preload = "auto";
	}

	applyBackgroundVolume();
	return bgMusic;
};

const ensureCountdownAudio = () => {
	if (!canUseAudio()) return null;

	if (!countdownAudio) {
		countdownAudio = new Audio(QUEST_COUNTDOWN_BEEP_SRC);
		countdownAudio.preload = "auto";
		countdownAudio.volume = 0.85;
	}

	return countdownAudio;
};

export function armQuestHostMusic() {
	if (!canUseAudio()) return;
	window.sessionStorage.setItem(ARMED_KEY, "1");
}

export function disarmQuestHostMusic() {
	if (!canUseAudio()) return;
	window.sessionStorage.removeItem(ARMED_KEY);
}

export function isQuestHostMusicArmed() {
	return canUseAudio() && window.sessionStorage.getItem(ARMED_KEY) === "1";
}

export function getQuestHostVolume() {
	userVolume = readStoredVolume();
	return userVolume;
}

export function setQuestHostVolume(nextVolume: number) {
	if (!canUseAudio()) return;
	userVolume = clampVolume(nextVolume);
	window.localStorage.setItem(VOLUME_KEY, String(userVolume));
	applyBackgroundVolume();
	emit();
}

export function subscribeQuestHostAudio(listener: AudioListener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export async function startQuestHostMusic() {
	const music = ensureBackgroundMusic();
	if (!music) return;

	armQuestHostMusic();
	try {
		await music.play();
	} catch {
		// The next host gesture will retry if the browser blocks autoplay.
	}
	emit();
}

export function stopQuestHostMusic() {
	if (!bgMusic) {
		disarmQuestHostMusic();
		emit();
		return;
	}

	bgMusic.pause();
	bgMusic.currentTime = 0;
	isDucked = false;
	applyBackgroundVolume();
	disarmQuestHostMusic();
	emit();
}

function duckQuestHostMusic() {
	isDucked = true;
	applyBackgroundVolume();
	emit();
}

function restoreQuestHostMusic() {
	isDucked = false;
	applyBackgroundVolume();
	emit();
}

export async function playQuestCountdownAudio() {
	const beep = ensureCountdownAudio();
	duckQuestHostMusic();

	if (!beep) {
		restoreQuestHostMusic();
		return;
	}

	let restored = false;
	const restoreOnce = () => {
		if (restored) return;
		restored = true;
		restoreQuestHostMusic();
	};

	try {
		beep.pause();
		beep.currentTime = 0;
		beep.onended = restoreOnce;
		window.setTimeout(restoreOnce, 5600);
		await beep.play();
	} catch {
		restoreOnce();
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FaAngleLeft, FaAngleRight, FaRegLightbulb } from "react-icons/fa6";
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";

interface NavigationControlsProps {
  currentView: any;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
}

export default function HostLiveNavigationControls({
  currentView,
  isFullscreen,
  onPrev,
  onNext,
  onToggleFullscreen,
}: NavigationControlsProps) {
  return (
    <div className="flex justify-center items-center py-4 gap-4">
      <FaAngleLeft
        className="cursor-pointer"
        onClick={onPrev}
        style={{ opacity: currentView === "choice" ? 0.5 : 1 }}
      />
      <FaRegLightbulb className="cursor-pointer" />
      <FaAngleRight
        className="cursor-pointer"
        onClick={onNext}
        style={{ opacity: currentView === "wordcloud" ? 0.5 : 1 }}
      />
      <button
        onClick={onToggleFullscreen}
        className="cursor-pointer text-[20px]"
      >
        {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
      </button>
    </div>
  );
}
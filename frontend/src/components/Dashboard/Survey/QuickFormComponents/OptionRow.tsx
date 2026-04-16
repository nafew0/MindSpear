"use client";
import React, { useCallback } from "react";
import { motion } from "framer-motion";
import type { QuestionOption } from "./quest";

type Props = {
  qid: string;
  qType: "checkbox" | "radio" | "dropdown";
  option: QuestionOption;
  isLast: boolean;
  onChangeText: (qid: string, optId: string, text: string) => void;
  onRemove: (qid: string, optId: string) => void;
  onAddOptionIfLast: (qid: string) => void;
  onPasteReplaceFromClipboard: (qid: string, targetOptId: string, pasted: string) => void;
};

const OptionRow: React.FC<Props> = ({
  qid,
  qType,
  option,
  isLast,
  onChangeText,
  onRemove,
  onAddOptionIfLast,
  onPasteReplaceFromClipboard,
}) => {
  const handleFocus = useCallback(() => {
    if (isLast) onAddOptionIfLast(qid);
  }, [isLast, onAddOptionIfLast, qid]);

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData("text");
    onPasteReplaceFromClipboard(qid, option.id, pasteText);
  };

  return (
    <motion.div
      key={option.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="relative group flex items-center w-full"
    >
      {qType === "radio" && <span className="w-4 h-4 mr-2 border-2 rounded-full border-gray-400" />}
      {qType === "checkbox" && <span className="w-4 h-4 mr-2 border-2 rounded border-gray-400" />}

      <input
        type="text"
        placeholder="New Option"
        value={option.text}
        onChange={(e) => onChangeText(qid, option.id, e.target.value)}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className="flex-1 border rounded-md p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
      />

      <motion.button
        whileHover={{ scale: 1.2, rotate: 90 }}
        onClick={() => onRemove(qid, option.id)}
        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-600 rounded"
      >
        ✕
      </motion.button>
    </motion.div>
  );
};

export default React.memo(OptionRow);

"use client";
import React from "react";
import { motion } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import OptionRow from "./OptionRow";
import type { QuestionBlock } from "./quest";

type Props = {
  q: QuestionBlock;
  onRemoveQuestion: (qid: string) => void;
  onLabelChange: (qid: string, v: string) => void;
  // option handlers
  onOptionTextChange: (qid: string, optId: string, text: string) => void;
  onAddOptionIfLast: (qid: string) => void;
  onRemoveOption: (qid: string, optId: string) => void;
  onPasteOptions: (qid: string, targetOptId: string, pasted: string) => void;
};

const QuestionItem: React.FC<Props> = ({
  q,
  onRemoveQuestion,
  onLabelChange,
  onOptionTextChange,
  onAddOptionIfLast,
  onRemoveOption,
  onPasteOptions,
}) => {
  return (
    <div className="relative group p-5 border rounded-xl my-8 transition-all">
      <button className="capitalize bg-[#fff] px-4 py-1 absolute top-[-20px] border rounded-xl "> {q?.type} </button>
      {/* Drag handle visual */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />  
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => onRemoveQuestion(q.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 py-2 text-red-600 text-xs p-1.5 rounded-md"
      >
        <Trash2 size={16} />
      </motion.button>

      {/* Label */}
      <input
        type="text"
        placeholder="Enter Question Label"
        value={q.label}
        className="w-full mt-2 border rounded-md p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
        onChange={(e) => onLabelChange(q.id, e.target.value)}
      />

      {/* Short Answer */}
      {q.type === "short-answer" && (
        <motion.input
          type="text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 w-full border rounded-md p-2 text-gray-500 pr-8 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
          placeholder="Short Answer"
          readOnly
        />
      )}

      {/* Choice types */}
      {["radio", "checkbox", "dropdown"].includes(q.type) && (
        <div className="mt-4 space-y-2">
          {q.options.map((opt, idx) => (
            <OptionRow
              key={opt.id}
              qid={q.id}
              qType={q.type as "checkbox" | "radio" | "dropdown"}
              option={opt}
              isLast={idx === q.options.length - 1}
              onChangeText={onOptionTextChange}
              onRemove={onRemoveOption}
              onAddOptionIfLast={onAddOptionIfLast}
              onPasteReplaceFromClipboard={onPasteOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(QuestionItem);

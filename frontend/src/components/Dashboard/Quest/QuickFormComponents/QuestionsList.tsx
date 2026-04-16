// QuickFormComponents/QuestionsList.tsx
"use client";
import React from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import QuestionItem from "./QuestionItem";
import type { QuestionBlock } from "./quest";

type Props = {
  questions: QuestionBlock[];
  onRemoveQuestion: (qid: string) => void;
  onLabelChange: (qid: string, v: string) => void;
  onReorder: (orderedIds: string[]) => void;

  // option handlers from parent (dispatching)
  onAddOptionIfLast: (qid: string) => void;
  onOptionTextChange: (qid: string, optId: string, text: string) => void;
  onRemoveOption: (qid: string, optId: string) => void;
  onPasteOptions: (qid: string, targetOptId: string, pasted: string) => void;
};

const QuestionsList: React.FC<Props> = ({
  questions,
  onRemoveQuestion,
  onLabelChange,
  onReorder,
  onAddOptionIfLast,
  onOptionTextChange,
  onRemoveOption,
  onPasteOptions,
}) => {
  console.log(questions, "questionsquestionsquestionsquestionsquestions");
  
  return (
    <Reorder.Group
      axis="y"
      values={questions}
      onReorder={(list) => onReorder(list.map((q) => q.id))}
    >
      <AnimatePresence>
        {questions.map((q) => (
          <Reorder.Item
            key={q.id}
            value={q}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionItem
              q={q}
              onRemoveQuestion={onRemoveQuestion}
              onLabelChange={onLabelChange}
              onOptionTextChange={onOptionTextChange}
              onAddOptionIfLast={onAddOptionIfLast}
              onRemoveOption={onRemoveOption}
              onPasteOptions={onPasteOptions}
            />
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};

export default React.memo(QuestionsList);

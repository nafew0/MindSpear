"use client";
import { QuestionBlock } from "@/components/Dashboard/Quest/QuickFormComponents/quest";
import React, { useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

/* ---------------- Preview Components ---------------- */
const CheckboxPreview: React.FC<{
  options: { id: string; text: string }[];
}> = ({ options }) => (
  <div className="space-y-2">
    {options.map((o) => (
      <label key={o.id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <span>{o.text}</span>
      </label>
    ))}
  </div>
);

const RadioPreview: React.FC<{
  options: { id: string; text: string }[];
  name: string;
}> = ({ options, name }) => (
  <div className="space-y-2">
    {options.map((o) => (
      <label key={o.id} className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} className="h-4 w-4 text-primary border-gray-300" />
        <span>{o.text}</span>
      </label>
    ))}
  </div>
);

const DropdownPreview: React.FC<{
  options: { id: string; text: string }[];
}> = ({ options }) => (
  <div className="relative">
    <select className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none">
      <option value="">Select an option</option>
      {options.map((o) => (
        <option key={o.id} value={o.text}>
          {o.text}
        </option>
      ))}
    </select>
    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
  </div>
);

const ShortAnswerPreview: React.FC = () => (
  <input
    type="text"
    placeholder="Your answer"
    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
  />
);

/* ---------------- Helpers ---------------- */
const parseSN = (sn?: string) => {
  const n = Number(sn);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER; // non-numeric last
};

/* ---------------- Main Preview ---------------- */
const QuickFormPreview: React.FC = () => {
  const [questions] = useState<QuestionBlock[]>([
    {
      id: "q1",
      questId: "demo",
      type: "checkbox",
      label: "Which fruits do you like?",
      serial_number: "1",
      options: [
        { id: "1", text: "Apple" },
        { id: "2", text: "Banana" },
        { id: "3", text: "Mango" },
      ],
    },
    {
      id: "q2",
      questId: "demo",
      type: "radio",
      label: "Choose your gender",
      serial_number: "2",
      options: [
        { id: "1", text: "Male" },
        { id: "2", text: "Female" },
      ],
    },
    {
      id: "q3",
      questId: "demo",
      type: "dropdown",
      label: "Select your country",
      serial_number: "3",
      options: [
        { id: "1", text: "Bangladesh" },
        { id: "2", text: "India" },
        { id: "3", text: "USA" },
      ],
    },
    {
      id: "q4",
      questId: "demo",
      type: "short-answer",
      label: "What is your favorite hobby?",
      serial_number: "4",
      options: [],
    },
  ]);

  const orderedQuestions = useMemo(() => {
    // Stable sort by numeric serial_number; keep original order when equal
    return questions
      .map((q, idx) => ({ q, idx }))
      .sort((a, b) => {
        const diff = parseSN(a.q.serial_number) - parseSN(b.q.serial_number);
        return diff !== 0 ? diff : a.idx - b.idx;
      })
      .map(({ q }) => q);
  }, [questions]);

  const renderPreview = (q: QuestionBlock) => {
    switch (q.type) {
      case "checkbox":
        return <CheckboxPreview options={q.options} />;
      case "radio":
        return <RadioPreview options={q.options} name={q.id} />;
      case "dropdown":
        return <DropdownPreview options={q.options} />;
      case "short-answer":
        return <ShortAnswerPreview />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 rounded-xl">
      {orderedQuestions.map((q) => (
        <div key={q.id} className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-3">
            {parseSN(q.serial_number)}. {q.label || "Untitled Question"}
          </p>
          {renderPreview(q)}
        </div>
      ))}
    </div>
  );
};

export default QuickFormPreview;

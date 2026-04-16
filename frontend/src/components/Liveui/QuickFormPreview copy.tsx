/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { QuestionBlock } from "@/components/Dashboard/Quest/QuickFormComponents/quest";
import React, { useEffect, useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
const CheckboxPreview: React.FC<{
  options: { id: string; text: string }[];
  selected: string[];
  onToggle: (optId: string, checked: boolean) => void;
}> = ({ options, selected, onToggle }) => (
  <div className="space-y-2">
    {options.map((o) => {
      const id = String(o.id);
      const checked = selected.includes(id);
      return (
        <label key={id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary border-gray-300 rounded"
            checked={checked}
            onChange={(e) => onToggle(id, e.target.checked)}
          />
          <span>{o.text}</span>
        </label>
      );
    })}
  </div>
);

const RadioPreview: React.FC<{
  options: { id: string; text: string }[];
  name: string;
  selected?: string;
  onSelect: (optId: string) => void;
}> = ({ options, name, selected, onSelect }) => (
  <div className="space-y-2">
    {options.map((o) => {
      const id = String(o.id);
      return (
        <label key={id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="h-4 w-4 text-primary border-gray-300"
            checked={selected === id}
            onChange={() => onSelect(id)}
          />
          <span>{o.text}</span>
        </label>
      );
    })}
  </div>
);

const DropdownPreview: React.FC<{
  options: { id: string; text: string }[];
  selected?: string;
  onSelect: (optId: string) => void;
}> = ({ options, selected, onSelect }) => (
  <div className="relative">
    <select
      className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
      value={selected ?? ""}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select an option</option>
      {options.map((o) => (
        <option key={o.id} value={String(o.id)}>
          {o.text}
        </option>
      ))}
    </select>
    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
  </div>
);

const ShortAnswerPreview: React.FC<{
  value?: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Your answer"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
  />
);


const parseSN = (sn?: string | number) => {
  const n = Number(sn);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER; // non-numeric last
};

type TaskQuestion = {
  id: number | string;
  text?: string;
  label?: string;
};

type TaskItem = {
  id?: number; 
  title?: string;
  description?: string | null;
  questions?: TaskQuestion[];
};

type Props = {
  task?: TaskItem;
  value?: string | null;
  onChange?: (val: string) => void;
};

const QuickFormPreview: React.FC<Props> = ({ task, onChange }) => {
  console.log(task, "tasktasktasktasktasktasktasktasktask");
  
  const [questions, setQuestions] = useState<QuestionBlock[]>(
    (task?.questions as unknown as QuestionBlock[]) ?? []
  );

  const [form, setForm] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    setQuestions(((task?.questions ?? []) as unknown as QuestionBlock[]) ?? []);
    setForm({});
  }, [task?.id]);

  const orderedQuestions = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .sort((a, b) => {
        const diff = parseSN(a.q.serial_number) - parseSN(b.q.serial_number);
        return diff !== 0 ? diff : a.idx - b.idx;
      })
      .map(({ q }) => q);
  }, [questions]);

  const update = (qid: string, val: string | string[]) => {
    const next = { ...form, [qid]: val };
    setForm(next);
    onChange?.(JSON.stringify(next));
  };

  const renderPreview = (q: QuestionBlock) => {
    const qid = String(q.id);
    const opts = (q.options ?? []).map((o) => ({
      id: String(o.id),
      text: o.text,
    }));

    switch (q.type) {
      case "checkbox": {
        const selected = Array.isArray(form[qid]) ? (form[qid] as string[]) : [];
        return (
          <CheckboxPreview
            options={opts}
            selected={selected}
            onToggle={(optId, checked) => {
              const set = new Set(selected);
              checked ? set.add(optId) : set.delete(optId);
              update(qid, Array.from(set));
            }}
          />
        );
      }
      case "radio": {
        const selected = typeof form[qid] === "string" ? (form[qid] as string) : "";
        return (
          <RadioPreview
            options={opts}
            name={qid}
            selected={selected}
            onSelect={(optId) => update(qid, optId)}
          />
        );
      }
      case "dropdown": {
        const selected = typeof form[qid] === "string" ? (form[qid] as string) : "";
        return (
          <DropdownPreview
            options={opts}
            selected={selected}
            onSelect={(optId) => update(qid, optId)}
          />
        );
      }
      case "short-answer": {
        const val = typeof form[qid] === "string" ? (form[qid] as string) : "";
        return <ShortAnswerPreview value={val} onChange={(v) => update(qid, v)} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 rounded-xl">
      {task?.id !== undefined && (
        <div className="text-xs text-gray-500 mb-2">Task ID: {task.id}</div>
      )}

      {orderedQuestions.map((q) => (
        <div key={String(q.id)} className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-3">
            {parseSN(q.serial_number)}. {q.label || "Untitled Question"}
          </p>
          {renderPreview(q)}
        </div>
      ))}

      {orderedQuestions.length === 0 && (
        <div className="p-4 text-sm text-gray-500 border rounded-lg bg-white">
          No questions for this quick form.
        </div>
      )}
    </div>
  );
};

export default QuickFormPreview;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Option } from "@/types/types";
import React from "react";
import { FaChevronDown } from "react-icons/fa6";


const cleanedOptions = (opts: Option[]) =>
	(opts ?? []).filter((o: any) => o.text !== null && String(o.text).trim() !== "");

const CheckboxReadOnly: React.FC<{
    options: Option[];
    selectedIdx1: number[];
}> = ({ options, selectedIdx1 }) => {
    const opts = cleanedOptions(options);
    return (
        <div className="space-y-2">
            {opts.map((o: any, i) => {
                const checked = selectedIdx1?.includes(i + 1);
                return (
                    <label
                        key={o.id}
                        className="flex items-center gap-2 cursor-not-allowed opacity-80"
                    >
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded"
                            checked={!!checked}
                            readOnly
                            disabled
                        />
                        <span>{o.text}</span>
                    </label>
                );
            })}
        </div>
    );
};

const RadioReadOnly: React.FC<{
    options: Option[];
    selectedIdx1?: number; 
    name: string;
}> = ({ options, selectedIdx1, name }) => {
    const opts = cleanedOptions(options);
    return (
        <div className="space-y-2">
            {opts.map((o:any, i) => {
                const checked = selectedIdx1 === i + 1;
                return (
                    <label
                        key={o.id}
                        className="flex items-center gap-2 cursor-not-allowed opacity-80"
                    >
                        <input
                            type="radio"
                            name={name}
                            className="h-4 w-4 text-primary border-gray-300"
                            checked={!!checked}
                            readOnly
                            disabled
                        />
                        <span>{o.text}</span>
                    </label>
                );
            })}
        </div>
    );
};

const DropdownReadOnly: React.FC<{
    options: Option[];
    selectedIdx1?: number; // 1-based
}> = ({ options, selectedIdx1 }) => {
    const opts:any = cleanedOptions(options);
    return (
        <div className="border rounded-md">
            <div className="relative px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
                <span className="text-sm text-gray-700">
                    {selectedIdx1 && opts[selectedIdx1 - 1]
                        ? opts[selectedIdx1 - 1].text
                        : "—"}
                </span>
                <FaChevronDown className="text-gray-400" />
            </div>
            <ul className="max-h-60 overflow-auto py-1">
                {opts.map((o:any, i:number) => {
                    const active = selectedIdx1 === i + 1;
                    return (
                        <li
                            key={o.id}
                            className={`px-3 py-2 text-sm ${
                                active
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-700"
                            }`}
                        >
                            {o.text}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const ShortAnswerReadOnly: React.FC<{ text?: string }> = ({ text }) => (
    <input
        type="text"
        value={text ?? ""}
        readOnly
        disabled
        className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
    />
);



function QuickFormAnswerView({data}: any) {
    console.log(data, "datadatadatadatadatadata");
    
	return (
		<div className=" grid grid-cols-2 gap-4">
			{data.answer_data.map((q: any) => {
				const sn = Number(q.serial_number);
				const titleNum = Number.isFinite(sn) ? sn : q.serial_number;
				return (
					<div
						key={q.id}
						className="p-4 bg-white rounded-lg border border-gray-200 shadow  "
					>
						<p className="font-medium text-gray-800 mb-3">
							{titleNum}. {q.label ?? "Untitled Question"}
						</p>

						{q.type === "checkbox" && (
							<CheckboxReadOnly
								options={q.options}
								selectedIdx1={q.selected_options ?? []}
							/>
						)}

						{q.type === "radio" && (
							<RadioReadOnly
								options={q.options}
								selectedIdx1={q.selected_option}
								name={`r-${q.id}`}
							/>
						)}

						{q.type === "dropdown" && (
							<DropdownReadOnly
								options={q.options}
								selectedIdx1={q.selected_option}
							/>
						)}

						{q.type === "short-answer" && (
							<ShortAnswerReadOnly text={q.text} />
						)}
					</div>
				);
			})}
		</div>
	);
}

export default QuickFormAnswerView;

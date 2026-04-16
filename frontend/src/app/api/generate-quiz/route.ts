import { NextResponse } from "next/server";
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
	const {
		selectedPages,
		topic,
		questionCount,
		questionType,
		difficulty,
		textData,
		audienceLevel,
		focusArea,
	} = await request.json();
	console.log(selectedPages, topic, questionCount, difficulty, textData);
	try {
		// const pageData = selectedPages
		// 	.map((pageId: number) => `Page ${pageId}`)
		// 	.join(", ");
		const prompt = `You are QuizGen AI, an expert question‑writer for an interactive quiz platform. 
Your ONLY reply must be a single, valid *UTF‑8 JSON* document that matches the schema below
—no markdown, no comments, no extra keys, no trailing commas, and no explanatory text.

──────────────────────────
INPUT MATERIAL
• Explicit text (verbatim):  ${textData}

QUIZ REQUIREMENTS
• Topic : ${topic}
• Total questions : ${questionCount}  (generate exactly this many)
• Allowed question types : ${questionType}              // e.g. ["multiple_choice", "single_choice","true_false","fill_in_the_blanks" "short_answer"]
• Difficulty : ${difficulty}                             
• Target audience level : ${audienceLevel}              
• Pedagogical focus : ${focusArea}                       // generate more questions from this area. 
──────────────────────────

CONSTRUCTION RULES  
1. Write each question so it can be answered solely from the INPUT MATERIAL.  
2. Use clear language appropriate for the stated audience and difficulty.  
3. Half of total questions should be single_choice | multiple_choice if selected as the question type.  Distribute the rest of question types (true_false | fill_in_the_blanks | short_answer) proportionally if more than one type is given.  
4. Randomise the order of distractors (choices) and ensure they are plausible.  
5. *Index answers starting at 0* so the first element in any choices array is index 0.  
6. For *multiple_choice*, the options should be exactly four (4), and correct_answer is an array of all correct indexes, in ascending order.  
7. For *true_false*, the choices array MUST be exactly ["True","False"].  
8. For *fill_in_the_blanks*, place only a single blank in the stem with “” and provide four choices. 
9. For *short_answer*, provide maximum three correct answers. select all three as correct_answer array.
10. Do NOT repeat questions; keep stems concise (< 25 words where possible).  

OUTPUT SCHEMA  (follow exactly)

{
  "questions": [
    {
      "question_text": "string",
      "question_type": "single_choice | multiple_choice | true_false | fill_in_the_blanks | short_answer",
      "options": {
        "choices": [ "string", "string", ... ],
        "correct_answer": 0 | [0,2]        // integer or array of integers as per the type
      }
    }
    // …repeat until questionCount items
  ]
}

► Return ONLY the JSON object; any deviation will cause parsing to fail.`;

		const openaiResponse = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-4o",
				temperature: 0.7,
				messages: [
					{
						role: "system",
						content:
							"You are a helpful assistant that outputs JSON only.",
					},
					{ role: "user", content: prompt },
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
			}
		);

		const raw = openaiResponse.data.choices[0].message.content;
		const quiz = raw.replace(/^```json\s*|```$/g, "").trim();

		return NextResponse.json({ quiz });
	} catch (error) {
		console.error("Error generating quiz:", error);
		return NextResponse.json(
			{ error: "Failed to generate quiz" },
			{ status: 500 }
		);
	}
}

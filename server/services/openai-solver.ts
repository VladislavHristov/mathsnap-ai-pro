/**
 * OpenAI Solver Service
 * Solves math problems step-by-step with Bulgarian language explanations
 */

import { invokeLLM } from "../_core/llm";

export interface MathSolution {
  problem: string;
  steps: string[];
  final_answer: string;
  explanation: string;
}

const bulgariaSolverPrompt = `Ти си учител по математика.

Реши задачата стъпка по стъпка.

Правила:
* Обяснявай ясно и разбираемо
* Не пропускай стъпки
* Използвай математически формули
* Обяснявай като на ученик
* Всички отговори трябва да са на БЪЛГАРСКИ език

Върни САМО валиден JSON:
{
  "problem": "...",
  "steps": ["...", "..."],
  "final_answer": "...",
  "explanation": "..."
}

Задача:
{{LATEX_FROM_OCR}}`;

export async function solveMathProblem(
  problemLatex: string,
  problemText: string
): Promise<MathSolution> {
  try {
    const problemInput = problemLatex || problemText;
    if (!problemInput) {
      throw new Error("No problem provided for solving");
    }

    const prompt = bulgariaSolverPrompt.replace("{{LATEX_FROM_OCR}}", problemInput);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Ти си учител по математика. Реши задачи стъпка по стъпка и върни САМО валиден JSON. Всички отговори трябва да са на БЪЛГАРСКИ език.",
        },
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from OpenAI");
    }

    const solution = JSON.parse(content) as MathSolution;

    // Validate the response structure
    if (!solution.problem || !Array.isArray(solution.steps) || !solution.final_answer) {
      throw new Error("Invalid solution response structure");
    }

    return solution;
  } catch (error) {
    console.error("Solver error:", error);
    throw error;
  }
}

/**
 * Generate explanation for a specific step
 */
export async function explainStep(
  problemLatex: string,
  stepNumber: number,
  previousSteps: string[]
): Promise<string> {
  try {
    const stepsContext = previousSteps.map((s, i) => `${i + 1}. ${s}`).join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Ти си учител по математика. Обяснявай стъпки на решаване на задачи на БЪЛГАРСКИ език.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Задача: ${problemLatex}\n\nПредишни стъпки:\n${stepsContext}\n\nОбясни стъпка ${stepNumber + 1} подробно.`,
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Step explanation error:", error);
    throw error;
  }
}

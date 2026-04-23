/**
 * OpenAI Solver Service
 * Solves math problems step-by-step with Bulgarian language explanations
 * Direct OpenAI API integration for better performance
 */

import { solveWithOpenAI, invokeOpenAI } from "./openai-llm";

export interface MathSolution {
  problem: string;
  steps: string[];
  final_answer: string;
  explanation: string;
}
const bulgariaSolverPrompt = `Ти си професионален учител по математика с експертиза в алгебра и решаване на уравнения.

Реши задачата стъпка по стъпка с МАКСИМАЛНА ТОЧНОСТ.

Правила:
- Разбий решението на ясни логични стъпки
- Използвай прости обяснения
- Покажи всички формули и преобразования
- Не пропускай нито една стъпка
- Проверяй всеки отговор чрез заместване в оригиналното уравнение
- Ако има множество методи, използвай най-простия и най-точния
- За полиномни уравнения: разложи на множители или използвай подходящата замяна
- За уравнения вида ax⁴ + bx² + c = 0: използвай замяната y = x² и реши квадратното уравнение
- Всички отговори трябва да са на БЪЛГАРСКИ език
- КРИТИЧНО: Всеки корен трябва да бъде проверен чрез заместване

Върни САМО валиден JSON:
{
  "problem": "...",
  "steps": ["...", "..."]
,
  "final_answer": "...",
  "explanation": "..."
}

Задача:
{{LATEX_FROM_OCR}}`

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

    const solution = await solveWithOpenAI(prompt) as MathSolution;

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

    const response = await invokeOpenAI({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Ти си учител по математика. Обяснявай стъпки на решаване на задачи на БЪЛГАРСКИ език.",
        },
        {
          role: "user",
          content: `Задача: ${problemLatex}\n\nПредишни стъпки:\n${stepsContext}\n\nОбясни стъпка ${stepNumber + 1} подробно.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
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

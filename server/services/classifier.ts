/**
 * OpenAI Classifier Service
 * Classifies math problems by type, difficulty, and requirements
 */

import { classifyWithOpenAI } from "./openai-llm";

export interface ProblemClassification {
  type: "algebra" | "calculus" | "geometry" | "trigonometry" | "statistics" | "other";
  difficulty: "easy" | "medium" | "hard";
  requires_graph: boolean;
  requires_symbolic_solver: boolean;
  description: string;
}

const classificationPrompt = `You are a mathematics expert. Analyze the following math problem and classify it.

Return ONLY a valid JSON object with this exact structure:
{
  "type": "algebra|calculus|geometry|trigonometry|statistics|other",
  "difficulty": "easy|medium|hard",
  "requires_graph": true/false,
  "requires_symbolic_solver": true/false,
  "description": "Brief description of the problem"
}

Guidelines:
- "type": Classify the primary mathematical domain
- "difficulty": Based on complexity and required knowledge
- "requires_graph": true if visualizing a function/graph would help understand the solution
- "requires_symbolic_solver": ALWAYS true for polynomial equations of degree >= 3 (cubic, quartic, etc.), equations with multiple variables, systems of equations, transcendental equations, or any equation requiring exact symbolic solutions. ONLY false for simple linear/quadratic equations.
- "description": 1-2 sentence summary of what the problem is asking

Problem:
{{PROBLEM}}`;

export async function classifyProblem(
  problemLatex: string,
  problemText: string
): Promise<ProblemClassification> {
  try {
    const problemInput = problemLatex || problemText;
    if (!problemInput) {
      throw new Error("No problem provided for classification");
    }

    const prompt = classificationPrompt.replace("{{PROBLEM}}", problemInput);

    const classification = await classifyWithOpenAI(prompt) as ProblemClassification;

    // Validate the response structure
    if (
      !classification.type ||
      !classification.difficulty ||
      typeof classification.requires_graph !== "boolean" ||
      typeof classification.requires_symbolic_solver !== "boolean"
    ) {
      throw new Error("Invalid classification response structure");
    }

    return classification;
  } catch (error) {
    console.error("Classification error:", error);
    throw error;
  }
}

/**
 * Quick classification without full details (for caching)
 */
export async function quickClassify(
  problemLatex: string
): Promise<{ type: string; requires_symbolic_solver: boolean }> {
  try {
    const prompt = `Classify this math problem: ${problemLatex}. Return JSON: {"type": "algebra|calculus|geometry|trigonometry|statistics|other", "requires_symbolic_solver": true/false}`;
    return await classifyWithOpenAI(prompt);
  } catch (error) {
    console.error("Quick classification error:", error);
    throw error;
  }
}

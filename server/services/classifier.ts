/**
 * OpenAI Classifier Service
 * Classifies math problems by type, difficulty, and requirements
 */

import { invokeLLM } from "../_core/llm";

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
- "requires_symbolic_solver": true if the problem requires symbolic computation (Wolfram Alpha), false if it can be solved with step-by-step explanation
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

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a mathematics expert. Classify math problems accurately and return valid JSON only.",
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

    const classification = JSON.parse(content) as ProblemClassification;

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
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a mathematics expert. Respond with ONLY a JSON object: {\"type\": \"algebra|calculus|geometry|trigonometry|statistics|other\", \"requires_symbolic_solver\": true/false}",
        },
        {
          role: "user",
          content: [{ type: "text", text: `Classify this math problem: ${problemLatex}` }],
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

    return JSON.parse(content);
  } catch (error) {
    console.error("Quick classification error:", error);
    throw error;
  }
}

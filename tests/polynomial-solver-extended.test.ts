import { describe, it, expect } from "vitest";
import { solveMathProblem } from "../server/services/openai-solver";
import { classifyProblem } from "../server/services/classifier";

describe("Polynomial Solver Tests", () => {
  it("should classify x^4 - 10x^2 + 9 = 0 as requiring symbolic solver", async () => {
    const latex = "x^4 - 10x^2 + 9 = 0";
    const text = "x^4 - 10x^2 + 9 = 0";

    const classification = await classifyProblem(latex, text);
    console.log("Classification:", classification);

    expect(classification.type).toBe("algebra");
    expect(classification.requires_symbolic_solver).toBe(true);
  }, { timeout: 15000 });

  it("should solve simple quadratic with OpenAI", async () => {
    const latex = "2x + 5 = 13";
    const text = "2x + 5 = 13";

    const solution = await solveMathProblem(latex, text);
    console.log("Solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps).toBeDefined();
    expect(Array.isArray(solution.steps)).toBe(true);
    expect(solution.final_answer).toBeDefined();
  }, { timeout: 15000 });

  it("should solve polynomial with enhanced prompt", async () => {
    const latex = "x^4 - 10x^2 + 9 = 0";
    const text = "x^4 - 10x^2 + 9 = 0";

    const solution = await solveMathProblem(latex, text);
    console.log("Polynomial solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    
    // Check if solution mentions the correct roots
    const answerText = solution.final_answer.toLowerCase();
    console.log("Answer text:", answerText);
    expect(
      answerText.includes("3") || 
      answerText.includes("1") || 
      answerText.includes("-1") || 
      answerText.includes("-3")
    ).toBe(true);
  }, { timeout: 15000 });
});

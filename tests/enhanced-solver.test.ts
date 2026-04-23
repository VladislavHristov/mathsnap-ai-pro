import { describe, it, expect } from "vitest";
import { solveWithVerification } from "../server/services/enhanced-solver";

describe("Enhanced Solver Tests - Textbook Examples", () => {
  it("should solve biquadratic equation: x^4 - 10x^2 + 9 = 0", async () => {
    const latex = "x^4 - 10x^2 + 9 = 0";
    const text = "x^4 - 10x^2 + 9 = 0";

    const solution = await solveWithVerification(latex, text);
    console.log("Biquadratic solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    expect(solution.verification).toBeDefined();
    
    // Check for correct roots
    const answerText = solution.final_answer.toLowerCase();
    expect(
      answerText.includes("3") && 
      answerText.includes("1") && 
      answerText.includes("-1") && 
      answerText.includes("-3")
    ).toBe(true);
  }, { timeout: 30000 });

  it("should solve incomplete quadratic: 2x^2 - 5x = 0", async () => {
    const latex = "2x^2 - 5x = 0";
    const text = "2x^2 - 5x = 0";

    const solution = await solveWithVerification(latex, text);
    console.log("Incomplete quadratic solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    
    // Check for correct roots: 0 and 2.5
    const answerText = solution.final_answer.toLowerCase();
    expect(
      answerText.includes("0") && 
      (answerText.includes("2.5") || answerText.includes("5/2"))
    ).toBe(true);
  }, { timeout: 30000 });

  it("should solve complete quadratic: 2x^2 - 5x - 3 = 0", async () => {
    const latex = "2x^2 - 5x - 3 = 0";
    const text = "2x^2 - 5x - 3 = 0";

    const solution = await solveWithVerification(latex, text);
    console.log("Complete quadratic solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    
    // Check for correct roots: 3 and -1/2
    const answerText = solution.final_answer.toLowerCase();
    expect(
      answerText.includes("3") && 
      (answerText.includes("-0.5") || answerText.includes("-1/2"))
    ).toBe(true);
  }, { timeout: 30000 });

  it("should solve quadratic with no real roots: 8x^2 - 5x + 7 = 0", async () => {
    const latex = "8x^2 - 5x + 7 = 0";
    const text = "8x^2 - 5x + 7 = 0";

    const solution = await solveWithVerification(latex, text);
    console.log("No real roots solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    
    // Check that solution mentions no real roots or complex numbers
    const answerText = solution.final_answer.toLowerCase();
    expect(
      answerText.includes("няма") || 
      answerText.includes("комплексни") || 
      answerText.includes("реални")
    ).toBe(true);
  }, { timeout: 30000 });

  it("should solve rational equation with verification", async () => {
    const latex = "\\frac{x+10}{2} - \\frac{x(x-2)}{3} = 5";
    const text = "(x+10)/2 - x(x-2)/3 = 5";

    const solution = await solveWithVerification(latex, text);
    console.log("Rational equation solution:", solution);

    expect(solution.problem).toBeDefined();
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.final_answer).toBeDefined();
    expect(solution.verification).toBeDefined();
  }, { timeout: 30000 });

  it("should include verification details in solution", async () => {
    const latex = "x^2 - 4 = 0";
    const text = "x^2 - 4 = 0";

    const solution = await solveWithVerification(latex, text);
    console.log("Solution with verification:", solution);

    expect(solution.verification).toBeDefined();
    expect(solution.verification?.method).toBeDefined();
    expect(solution.verification?.result).toBeDefined();
    expect(solution.verification?.details).toBeDefined();
  }, { timeout: 30000 });
});

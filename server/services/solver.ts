/**
 * Main Solver Service
 * Orchestrates the hybrid AI pipeline: OCR → Classification → Solving
 */

import { extractTextFromUrl, extractTextFromBase64 } from "./google-vision";
import { classifyProblem, ProblemClassification } from "./classifier";
import { solveMathProblem, MathSolution } from "./openai-solver";
import { solveWithVerification } from "./enhanced-solver";
import { solveSymbolic, getPlot, SymbolicSolution } from "./wolfram";

export interface SolveRequest {
  image_url?: string;
  image_base64?: string;
  mime_type?: string;
}

export interface SolveResponse {
  extracted: {
    latex: string;
    text: string;
  };
  classification: ProblemClassification;
  solution: MathSolution | SymbolicSolution;
  graph_url?: string;
  solver_used: "openai" | "wolfram";
}

/**
 * Detect if a problem is a polynomial equation of degree >= 3
 * This ensures high-degree polynomials are always sent to Wolfram Alpha for accuracy
 */
function isHighDegreePolynomial(latex: string, text: string): boolean {
  const combined = (latex + " " + text).toLowerCase();
  // Check for patterns like x^4, x^3, x^5, etc. (both ^ and \^)
  const highDegreePattern = /x[\^\\^][3-9]|x[\^\\^]\d{2,}|x\*\*[3-9]|x\*\*\d{2,}/;
  // Check for biquadratic pattern (ax^4 + bx^2 + c = 0)
  const biquadraticPattern = /(x[\^\\^]4|x\*\*4).*(x[\^\\^]2|x\*\*2)|(x[\^\\^]2|x\*\*2).*(x[\^\\^]4|x\*\*4)/;
  return highDegreePattern.test(combined) || biquadraticPattern.test(combined);
}

/**
 * Main solve function - orchestrates the entire pipeline
 */
export async function solveProblem(request: SolveRequest): Promise<SolveResponse> {
  try {
    // Step 1: Extract text from image using Google Vision API
    let extracted;
    if (request.image_url) {
      extracted = await extractTextFromUrl(request.image_url);
    } else if (request.image_base64) {
      extracted = await extractTextFromBase64(
        request.image_base64,
        request.mime_type || "image/jpeg"
      );
    } else {
      throw new Error("No image provided");
    }

    console.log("Extracted:", extracted);

    // Step 2: Classify the problem
    const classification = await classifyProblem(extracted.latex, extracted.text);
    console.log("Classification:", classification);

    // Step 3: Decide solver based on classification and polynomial detection
    let solution: MathSolution | SymbolicSolution;
    let solverUsed: "openai" | "wolfram" = "openai";
    let graphUrl: string | undefined;

    // Force Wolfram for high-degree polynomials (degree >= 3)
    const forceWolfram = isHighDegreePolynomial(extracted.latex, extracted.text);
    const useWolfram = classification.requires_symbolic_solver || forceWolfram;
    
    console.log(`Using ${useWolfram ? "Wolfram" : "Enhanced OpenAI"} solver for: ${extracted.text}`);

    if (useWolfram) {
      // Use Wolfram Alpha for symbolic solving
      try {
        solution = await solveSymbolic(extracted.latex, extracted.text);
        solverUsed = "wolfram";

        // Get graph if available
        if (classification.requires_graph) {
          try {
            const plot = await getPlot(extracted.latex);
            graphUrl = plot.url;
          } catch (e) {
            console.warn("Could not fetch graph:", e);
          }
        }
      } catch (wolframError) {
        console.warn("Wolfram solving failed, falling back to Enhanced OpenAI:", wolframError);
        solution = await solveWithVerification(extracted.latex, extracted.text);
        solverUsed = "openai";
      }
    } else {
      // Use enhanced OpenAI solver with verification
      solution = await solveWithVerification(extracted.latex, extracted.text);
      solverUsed = "openai";
    }

    // Return response
    return {
      extracted,
      classification,
      solution,
      graph_url: graphUrl,
      solver_used: solverUsed,
    };
  } catch (error) {
    console.error("Solve error:", error);
    throw error;
  }
}

/**
 * Classify a problem without solving
 */
export async function classifyOnly(request: SolveRequest): Promise<{
  extracted: { latex: string; text: string };
  classification: ProblemClassification;
}> {
  try {
    // Extract text from image using Google Vision API
    let extracted;
    if (request.image_url) {
      extracted = await extractTextFromUrl(request.image_url);
    } else if (request.image_base64) {
      extracted = await extractTextFromBase64(
        request.image_base64,
        request.mime_type || "image/jpeg"
      );
    } else {
      throw new Error("No image provided");
    }

    // Classify the problem
    const classification = await classifyProblem(extracted.latex, extracted.text);

    return {
      extracted,
      classification,
    };
  } catch (error) {
    console.error("Classification error:", error);
    throw error;
  }
}

/**
 * Get a graph for a problem
 */
export async function getGraphForProblem(
  problemLatex: string
): Promise<{ url: string; title: string }> {
  try {
    return await getPlot(problemLatex);
  } catch (error) {
    console.error("Graph error:", error);
    throw error;
  }
}

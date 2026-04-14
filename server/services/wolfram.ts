/**
 * Wolfram Alpha Solver Service
 * Solves symbolic and complex math problems using Wolfram Alpha API
 */

import axios from "axios";

interface WolframPod {
  title: string;
  id: string;
  subpods?: Array<{
    plaintext?: string;
    image?: {
      src: string;
      alt: string;
    };
  }>;
}

interface WolframQueryResult {
  queryresult: {
    success: boolean;
    error: boolean;
    pods?: WolframPod[];
  };
}

export interface SymbolicSolution {
  input: string;
  result: string;
  steps: string[];
  has_graph: boolean;
}

export async function solveSymbolic(
  problemLatex: string,
  problemText: string
): Promise<SymbolicSolution> {
  try {
    const appId = process.env.WOLFRAM_APP_ID;
    if (!appId) {
      throw new Error("WOLFRAM_APP_ID not configured");
    }

    const input = problemLatex || problemText;
    if (!input) {
      throw new Error("No problem provided for symbolic solving");
    }

    // Query Wolfram Alpha API
    const response = await axios.get<WolframQueryResult>(
      "https://api.wolframalpha.com/v2/query",
      {
        params: {
          input,
          appid: appId,
          output: "json",
          format: "plaintext",
          includepodid: "Solution,Step-by-step solution,Result,Plot",
        },
        timeout: 30000,
      }
    );

    const queryResult = response.data.queryresult;

    if (!queryResult.success || queryResult.error) {
      throw new Error("Wolfram Alpha query failed");
    }

    if (!queryResult.pods || queryResult.pods.length === 0) {
      throw new Error("No solution found from Wolfram Alpha");
    }

    // Extract solution and steps
    let result = "";
    const steps: string[] = [];
    let hasGraph = false;

    for (const pod of queryResult.pods) {
      if (pod.id === "Solution" || pod.id === "Result") {
        if (pod.subpods?.[0]?.plaintext) {
          result = pod.subpods[0].plaintext;
        }
      } else if (pod.id === "Step-by-step solution") {
        if (pod.subpods) {
          for (const subpod of pod.subpods) {
            if (subpod.plaintext) {
              steps.push(subpod.plaintext);
            }
          }
        }
      } else if (pod.id === "Plot") {
        hasGraph = true;
      }
    }

    return {
      input,
      result,
      steps,
      has_graph: hasGraph,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Wolfram Alpha error: ${error.response?.status} - ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Get a plot/graph from Wolfram Alpha
 */
export async function getPlot(
  problemLatex: string
): Promise<{ url: string; title: string }> {
  try {
    const appId = process.env.WOLFRAM_APP_ID;
    if (!appId) {
      throw new Error("WOLFRAM_APP_ID not configured");
    }

    const input = problemLatex;
    if (!input) {
      throw new Error("No problem provided for plotting");
    }

    // Query Wolfram Alpha API for plot
    const response = await axios.get<WolframQueryResult>(
      "https://api.wolframalpha.com/v2/query",
      {
        params: {
          input,
          appid: appId,
          output: "json",
          includepodid: "Plot",
        },
        timeout: 30000,
      }
    );

    const queryResult = response.data.queryresult;

    if (!queryResult.success || !queryResult.pods) {
      throw new Error("No plot available from Wolfram Alpha");
    }

    const plotPod = queryResult.pods.find((p) => p.id === "Plot");
    if (!plotPod || !plotPod.subpods?.[0]?.image) {
      throw new Error("No plot image found");
    }

    return {
      url: plotPod.subpods[0].image.src,
      title: plotPod.title,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Wolfram Alpha plot error: ${error.response?.status} - ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Determine if a problem is suitable for Wolfram Alpha
 */
export async function isSuitableForWolfram(
  problemLatex: string
): Promise<boolean> {
  try {
    const appId = process.env.WOLFRAM_APP_ID;
    if (!appId) {
      return false;
    }

    // Quick query to check if Wolfram can solve it
    const response = await axios.get<WolframQueryResult>(
      "https://api.wolframalpha.com/v2/query",
      {
        params: {
          input: problemLatex,
          appid: appId,
          output: "json",
          format: "plaintext",
        },
        timeout: 10000,
      }
    );

    return response.data.queryresult.success && !response.data.queryresult.error;
  } catch {
    return false;
  }
}

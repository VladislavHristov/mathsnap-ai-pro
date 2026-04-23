/**
 * OpenAI LLM Service
 * Direct integration with OpenAI API for classification and solving
 * Replaces Forge/Gemini backend for better performance and control
 */

import axios from "axios";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenAI API with proper error handling
 */
export async function invokeOpenAI(request: OpenAIRequest): Promise<OpenAIResponse> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      {
        model: request.model || "gpt-4o",
        messages: request.messages,
        response_format: request.response_format,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens || 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        throw new Error("OpenAI API authentication failed - invalid API key");
      } else if (status === 429) {
        throw new Error("OpenAI API rate limit exceeded - please try again later");
      } else if (status === 500) {
        throw new Error("OpenAI API server error - please try again later");
      }

      throw new Error(`OpenAI API error: ${message}`);
    }
    throw error;
  }
}

/**
 * Helper to invoke OpenAI for classification
 */
export async function classifyWithOpenAI(prompt: string): Promise<any> {
  const response = await invokeOpenAI({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a mathematics expert. Classify math problems accurately and return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

/**
 * Helper to invoke OpenAI for solving
 */
export async function solveWithOpenAI(prompt: string): Promise<any> {
  const response = await invokeOpenAI({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Ти си професионален учител по математика. Реши задачи стъпка по стъпка с ясни логични стъпки, прости обяснения и всички формули. Не пропускай стъпки. Върни САМО валиден JSON. Всички отговори трябва да са на BULGARIAN език.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

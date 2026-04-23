import { describe, it, expect } from "vitest";
import axios from "axios";

describe("OpenAI API Validation", () => {
  it("should validate OpenAI API key with a simple classification test", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a mathematics expert. Respond with valid JSON only.",
            },
            {
              role: "user",
              content:
                'Classify this math problem: "Solve x^2 - 5x + 6 = 0". Return JSON: {"type": "algebra", "difficulty": "easy"}',
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.choices).toBeDefined();
      expect(response.data.choices[0].message.content).toBeDefined();

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      expect(parsed.type).toBeDefined();
      expect(parsed.difficulty).toBeDefined();

      console.log("✅ OpenAI API validation successful");
      console.log("Response:", parsed);
    } catch (error: any) {
      console.error("❌ OpenAI API validation failed:", error.message);
      if (error.response?.status === 401) {
        throw new Error("Invalid OpenAI API key - authentication failed");
      }
      throw error;
    }
  });

  it("should validate OpenAI API can generate step-by-step solutions", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a professional math teacher. Solve problems step-by-step in Bulgarian. Return ONLY valid JSON.",
            },
            {
              role: "user",
              content: `Реши задачата: 2x + 5 = 13. Върни JSON: {"problem": "...", "steps": [...], "final_answer": "...", "explanation": "..."}`,
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      expect(response.status).toBe(200);
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);

      expect(parsed.problem).toBeDefined();
      expect(parsed.steps).toBeDefined();
      expect(Array.isArray(parsed.steps)).toBe(true);
      expect(parsed.final_answer).toBeDefined();

      console.log("✅ OpenAI solver validation successful");
      console.log("Solution steps:", parsed.steps.length);
    } catch (error: any) {
      console.error("❌ OpenAI solver validation failed:", error.message);
      throw error;
    }
  });
});

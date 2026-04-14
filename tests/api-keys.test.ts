import { describe, it, expect } from "vitest";

describe("API Keys Validation", () => {
  it("should validate OpenAI API key format", () => {
    const openaiKey = process.env.OPENAI_API_KEY;
    expect(openaiKey).toBeDefined();
    expect(openaiKey).toMatch(/^sk-/);
  });

  it("should validate Wolfram Alpha AppID format", () => {
    const wolframId = process.env.WOLFRAM_APP_ID;
    expect(wolframId).toBeDefined();
    expect(wolframId?.length).toBeGreaterThan(0);
  });

  it("should test OpenAI API connectivity", async () => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should test Wolfram Alpha API connectivity", async () => {
    const wolframId = process.env.WOLFRAM_APP_ID;
    if (!wolframId) {
      throw new Error("WOLFRAM_APP_ID not set");
    }

    const response = await fetch(
      `https://www.wolframalpha.com/api/v1/query?input=2%2B2&format=json&appid=${wolframId}`
    );

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(0);
  });
});

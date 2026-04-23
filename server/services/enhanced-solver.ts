/**
 * Enhanced Math Solver with Verification Layer
 * Implements comprehensive solving methods based on 8th grade textbook
 * Includes verification and validation for all solution types
 */

import { solveWithOpenAI, invokeOpenAI } from "./openai-llm";
import { classifyProblem } from "./classifier";

export interface MathSolution {
  problem: string;
  steps: string[];
  final_answer: string;
  explanation: string;
  verification?: {
    method: string;
    result: boolean;
    details: string;
  };
}

/**
 * Comprehensive solver prompt covering all 8th grade problem types
 */
const comprehensiveSolverPrompt = `Ти си експертен учител по математика за 8 клас с дълбоко познание на:
- Квадратни уравнения (непълни, пълни, бикватдратни)
- Уравнения от по-висока степен, свеждащи се до квадратни
- Дробни (рационални) уравнения
- Иррационални уравнения
- Геометрични задачи (триъгълници, трапец, окръжност)
- Вектори и еднаквости
- Комбинаторика

ПРАВИЛА ЗА РЕШАВАНЕ:

1. **НЕПЪЛНИ КВАДРАТНИ УРАВНЕНИЯ:**
   - ax² + bx = 0 → x(ax + b) = 0 → x₁ = 0; x₂ = -b/a
   - ax² + c = 0 → x² = -c/a → проверка дали -c/a ≥ 0
   - ax² = 0 → x = 0 (двоен корен)

2. **ПЪЛНИ КВАДРАТНИ УРАВНЕНИЯ:**
   - Използвай формула: x₁,₂ = (-b ± √D) / 2a, където D = b² - 4ac
   - Проверка: D > 0 (две решения), D = 0 (едно решение), D < 0 (няма решение)

3. **БИКВАТДРАТНИ УРАВНЕНИЯ (ax⁴ + bx² + c = 0):**
   - Замяна: y = x²
   - Решаване на квадратното уравнение: ay² + by + c = 0
   - За всяко положително y: x = ±√y
   - За отрицателно y: няма решение
   - КРИТИЧНО: Всеки корен трябва да бъде проверен чрез заместване

4. **УРАВНЕНИЯ ОТ ПО-ВИСОКА СТЕПЕН:**
   - Разложи на множители или използвай подходяща замяна
   - Реши всяко получено уравнение

5. **ДРОБНИ УРАВНЕНИЯ:**
   - Определи дефиниционното множество (знаменателите ≠ 0)
   - Привеждане към общ знаменател
   - Реши полученото уравнение
   - КРИТИЧНО: Проверка дали решенията са в дефиниционното множество

6. **ИРРАЦИОНАЛНИ УРАВНЕНИЯ:**
   - Изолирай радикала
   - Повдигни на степен
   - Реши полученото уравнение
   - КРИТИЧНО: Проверка за външни решения чрез заместване

7. **ГЕОМЕТРИЧНИ ЗАДАЧИ:**
   - Използвай свойства на триъгълници, трапец, окръжност
   - Приложи теорема на Талес, свойства на средните отсечки
   - Визуализирай задачата мислено

ОБЩИ ПРАВИЛА:
- Разбий решението на ясни логични стъпки
- Покажи всички преобразования и формули
- Не пропускай нито една стъпка
- ВСЕКИ КОРЕН ТРЯБВА ДА БЪДЕ ПРОВЕРЕН чрез заместване в оригиналното уравнение
- Всички обяснения на БЪЛГАРСКИ език
- Ако има множество методи, използвай най-простия и най-точния
- Не измисляй данни - работи само с дадени числа

ВЕРИФИКАЦИЯ:
- За всяко решение: заместване в оригиналното уравнение
- За дробни уравнения: проверка дефиниционното множество
- За иррационални уравнения: проверка за външни решения
- Окончателна проверка: всички корени трябва да удовлетворяват оригиналното уравнение

Върни САМО валиден JSON:
{
  "problem": "...",
  "steps": ["...", "..."],
  "final_answer": "...",
  "explanation": "...",
  "verification_details": "..."
}

Задача:
{{PROBLEM}}`;

/**
 * Verification prompt for checking solutions
 */
const verificationPrompt = `Проверка на математическо решение:

Оригинално уравнение: {{EQUATION}}
Предложено решение: {{SOLUTION}}
Стъпки: {{STEPS}}

Задача: Проверка дали решението е ТОЧНО.

Метод на проверка:
1. Заместване на всеки корен в оригиналното уравнение
2. Проверка дали уравнението е удовлетворено
3. Проверка на дефиниционното множество (за дробни уравнения)
4. Проверка за външни решения (за иррационални уравнения)

Върни JSON:
{
  "is_correct": true/false,
  "verification_method": "...",
  "details": "...",
  "issues": ["..."]
}`;

/**
 * Detect problem type and apply specific solving strategy
 */
async function detectAndSolveByType(
  problemLatex: string,
  problemText: string
): Promise<MathSolution> {
  const classification = await classifyProblem(problemLatex, problemText);
  
  // Build type-specific prompt
  let typeSpecificPrompt = comprehensiveSolverPrompt;
  
  if (classification.type === "algebra") {
    if (problemLatex.includes("^4") || problemLatex.includes("^3")) {
      typeSpecificPrompt += "\n\nТОВА Е ПОЛИНОМНО УРАВНЕНИЕ. Използвай замяна или разложение на множители.";
    }
    if (problemLatex.includes("/") || problemLatex.includes("\\frac")) {
      typeSpecificPrompt += "\n\nТОВА Е ДРОБНО УРАВНЕНИЕ. Определи дефиниционното множество преди решаване.";
    }
    if (problemLatex.includes("\\sqrt")) {
      typeSpecificPrompt += "\n\nТОВА Е ИРАЦИОНАЛНО УРАВНЕНИЕ. Провери за външни решения.";
    }
  }
  
  const problem = problemLatex || problemText;
  const prompt = typeSpecificPrompt.replace("{{PROBLEM}}", problem);
  
  const solution = await solveWithOpenAI(prompt) as MathSolution;
  
  if (!solution.problem || !Array.isArray(solution.steps) || !solution.final_answer) {
    throw new Error("Invalid solution response structure");
  }
  
  return solution;
}

/**
 * Verify solution by substitution
 */
async function verifySolution(
  equation: string,
  solution: MathSolution
): Promise<{ is_correct: boolean; details: string }> {
  try {
    const prompt = verificationPrompt
      .replace("{{EQUATION}}", equation)
      .replace("{{SOLUTION}}", solution.final_answer)
      .replace("{{STEPS}}", solution.steps.join(" → "));
    
    const verificationResponse = await invokeOpenAI({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    const verificationContent = verificationResponse.choices[0].message.content;
    const result = JSON.parse(verificationContent);
    return {
      is_correct: result.is_correct,
      details: result.details || "",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      is_correct: false,
      details: "Verification failed",
    };
  }
}

/**
 * Main enhanced solve function with verification
 */
export async function solveWithVerification(
  problemLatex: string,
  problemText: string
): Promise<MathSolution> {
  try {
    // Step 1: Detect problem type and solve
    const solution = await detectAndSolveByType(problemLatex, problemText);
    
    // Step 2: Verify solution
    const equation = problemLatex || problemText;
    const verification = await verifySolution(equation, solution);
    
    // Step 3: Add verification details to solution
    solution.verification = {
      method: "Substitution and domain check",
      result: verification.is_correct,
      details: verification.details,
    };
    
    // If verification failed, attempt to re-solve with additional guidance
    if (!verification.is_correct) {
      console.warn("Initial solution verification failed, attempting re-solve...");
      const resolvPrompt = comprehensiveSolverPrompt
        .replace("{{PROBLEM}}", equation)
        + "\n\nВНИМАНИЕ: Предишното решение не беше точно. Провери всеки корен чрез заместване.";
      
      const reResponse = await invokeOpenAI({
        model: "gpt-4o",
        messages: [{ role: "user", content: resolvPrompt }],
        response_format: { type: "json_object" },
      });
      const reSolutionContent = reResponse.choices[0].message.content;
      const reSolution = JSON.parse(reSolutionContent) as MathSolution;
      
      if (reSolution.problem && Array.isArray(reSolution.steps)) {
        const reVerification = await verifySolution(equation, reSolution);
        reSolution.verification = {
          method: "Substitution and domain check (re-solved)",
          result: reVerification.is_correct,
          details: reVerification.details,
        };
        return reSolution;
      }
    }
    
    return solution;
  } catch (error) {
    console.error("Enhanced solver error:", error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function solveMathProblem(
  problemLatex: string,
  problemText: string
): Promise<MathSolution> {
  return solveWithVerification(problemLatex, problemText);
}

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { solveProblem, classifyOnly, getGraphForProblem } from "./services/solver";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Math Solver Routes
  math: router({
    solve: publicProcedure
      .input(
        z.object({
          image_url: z.string().url().optional(),
          image_base64: z.string().optional(),
          mime_type: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await solveProblem(input);
      }),

    classify: publicProcedure
      .input(
        z.object({
          image_url: z.string().url().optional(),
          image_base64: z.string().optional(),
          mime_type: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await classifyOnly(input);
      }),

    graph: publicProcedure
      .input(
        z.object({
          problem_latex: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await getGraphForProblem(input.problem_latex);
      }),
  }),
});

export type AppRouter = typeof appRouter;

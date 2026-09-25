import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { createOpenAI } from "@ai-sdk/openai"
import { env } from "@/env";
import { generateObject } from "ai";

const openai = createOpenAI({
    apiKey: env.OPENAI_KEY,
})
export const travelRouter = createTRPCRouter({
    getDistance: publicProcedure
        .input(z.object({ start_destination: z.string(), end_destination: z.string() }))
        .mutation(async ({ input }) => {
            const { start_destination, end_destination } = input;

            const result = await generateObject({
                model: openai.chat("gpt-4o-mini"),
                schemaName: "travel",
                schemaDescription: "Calculate the distance between two destinations",
                schema: z.object({
                    start_destination: z.string(),
                    end_destination: z.string(),
                    distance: z.number(),
                }),
                prompt: `Calculate the distance between ${start_destination} and ${end_destination}, just estimate it and return in km`,
            })

            return { object: result.object };
        })
})
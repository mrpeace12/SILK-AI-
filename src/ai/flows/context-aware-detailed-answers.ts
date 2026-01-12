'use server';

/**
 * @fileOverview An AI agent that provides detailed, context-aware answers.
 *
 * - contextAwareDetailedAnswers - A function that provides detailed answers based on user context.
 * - ContextAwareDetailedAnswersInput - The input type for the contextAwareDetailedAnswers function.
 * - ContextAwareDetailedAnswersOutput - The return type for the contextAwareDetailedAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextAwareDetailedAnswersInputSchema = z.object({
  query: z.string().describe('The user query.'),
  userProfile: z
    .string()
    .optional()
    .describe('The user profile information, if available.'),
  pastInteractions: z
    .string()
    .optional()
    .describe('The history of past interactions with the user, if available.'),
});
export type ContextAwareDetailedAnswersInput = z.infer<
  typeof ContextAwareDetailedAnswersInputSchema
>;

const ContextAwareDetailedAnswersOutputSchema = z.object({
  answer: z.string().describe('The detailed and context-aware answer.'),
  sources: z.string().optional().describe('Sources used to formulate answer'),
});
export type ContextAwareDetailedAnswersOutput = z.infer<
  typeof ContextAwareDetailedAnswersOutputSchema
>;

export async function contextAwareDetailedAnswers(
  input: ContextAwareDetailedAnswersInput
): Promise<ContextAwareDetailedAnswersOutput> {
  return contextAwareDetailedAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAwareDetailedAnswersPrompt',
  input: {schema: ContextAwareDetailedAnswersInputSchema},
  output: {schema: ContextAwareDetailedAnswersOutputSchema},
  prompt: `You are an AI assistant that provides detailed and context-aware answers. Use the user profile and past interactions to tailor the response.

User Query: {{{query}}}

User Profile: {{{userProfile}}}

Past Interactions: {{{pastInteractions}}}

Answer in a way that is psychologically appealing to the user.  If the user asks a question about a business or statistics, be sure to include a graph or chart to better explain the answer.

Sources: `,
});

const contextAwareDetailedAnswersFlow = ai.defineFlow(
  {
    name: 'contextAwareDetailedAnswersFlow',
    inputSchema: ContextAwareDetailedAnswersInputSchema,
    outputSchema: ContextAwareDetailedAnswersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

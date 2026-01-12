'use server';

/**
 * @fileOverview A flow that generates charts and graphs for business or statistical questions.
 *
 * - generateChartsAndGraphs - A function that handles the chart and graph generation process.
 * - GenerateChartsAndGraphsInput - The input type for the generateChartsAndGraphs function.
 * - GenerateChartsAndGraphsOutput - The return type for the generateChartsAndGraphs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartsAndGraphsInputSchema = z.object({
  query: z.string().describe('The user query about business or statistical data.'),
});
export type GenerateChartsAndGraphsInput = z.infer<typeof GenerateChartsAndGraphsInputSchema>;

const GenerateChartsAndGraphsOutputSchema = z.object({
  response: z.string().describe('The AI response to the query, including the generated chart or graph.'),
  chartDataUri: z.string().optional().describe('The data URI of the generated chart or graph.'),
});
export type GenerateChartsAndGraphsOutput = z.infer<typeof GenerateChartsAndGraphsOutputSchema>;

export async function generateChartsAndGraphs(input: GenerateChartsAndGraphsInput): Promise<GenerateChartsAndGraphsOutput> {
  return generateChartsAndGraphsFlow(input);
}

const generateChartTool = ai.defineTool({
    name: 'generateChart',
    description: 'Generates a chart or graph based on the provided data and type.',
    inputSchema: z.object({
        dataDescription: z.string().describe('A description of the data to be visualized in the chart or graph.'),
        chartType: z.enum(["bar", "line", "pie", "scatter"]).describe('The type of chart or graph to generate.'),
    }),
    outputSchema: z.string().describe('A data URI of the generated chart or graph image.'),
    async execute(input) {
      // Mock implementation for chart generation (replace with actual chart generation logic)
      console.log("Generating chart with: ", input.dataDescription, input.chartType);
      // Simulate chart generation by returning a placeholder data URI
      return `data:image/svg+xml;base64,${btoa('<svg width=\
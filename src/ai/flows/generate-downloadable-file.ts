'use server';

/**
 * @fileOverview A flow that generates downloadable files based on user requests.
 *
 * - generateDownloadableFile - A function that handles the file generation process.
 * - GenerateDownloadableFileInput - The input type for the generateDownloadableFile function.
 * - GenerateDownloadableFileOutput - The return type for the generateDownloadableFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDownloadableFileInputSchema = z.object({
  fileType: z.string().describe('The type of file to generate (e.g., code, document).'),
  contentRequest: z.string().describe('The specific content requested for the file.'),
});
export type GenerateDownloadableFileInput = z.infer<typeof GenerateDownloadableFileInputSchema>;

const GenerateDownloadableFileOutputSchema = z.object({
  fileDataBase64: z.string().describe('The generated file content as a base64 encoded string.'),
  fileType: z.string().describe('MIME type for the file.'),
  filename: z.string().describe('Suggested filename for the generated file.'),
});
export type GenerateDownloadableFileOutput = z.infer<typeof GenerateDownloadableFileOutputSchema>;

export async function generateDownloadableFile(input: GenerateDownloadableFileInput): Promise<GenerateDownloadableFileOutput> {
  return generateDownloadableFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDownloadableFilePrompt',
  input: {schema: GenerateDownloadableFileInputSchema},
  output: {schema: GenerateDownloadableFileOutputSchema},
  prompt: `You are an AI assistant specialized in generating downloadable files.

  The user will specify a file type and the desired content.
  You should generate the file content in the specified format, then encode to base64.
  Determine the correct file extension based on the file type.

  File Type: {{{fileType}}}
  Content Request: {{{contentRequest}}}

  Output fileDataBase64 should be the base64 encoded string of file content.
  Output fileType should be the mime type of the file. For example, application/json or text/plain.
  Output filename should be the name of the file.
  `,
});

const generateDownloadableFileFlow = ai.defineFlow(
  {
    name: 'generateDownloadableFileFlow',
    inputSchema: GenerateDownloadableFileInputSchema,
    outputSchema: GenerateDownloadableFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

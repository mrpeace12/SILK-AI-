
import { ai } from '@/ai/genkit';
import { streamToResponse, type Message } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';

const getAllProjectFiles = ai.defineTool(
  {
    name: 'getAllProjectFiles',
    description: 'Get all the source code files for the entire project as a single file.',
    inputSchema: z.object({
      reason: z.string().describe("The user's reason for requesting the project files."),
    }),
    outputSchema: z.object({
      fileDataBase64: z.string().describe('The generated zip file content as a base64 encoded string.'),
      fileType: z.string().describe('MIME type for the file.'),
      filename: z.string().describe('Suggested filename for the generated file.'),
    }),
  },
  async () => {
    // This is an in-memory zip file creation.
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    
    const output: Buffer[] = [];
    
    // Create a promise to handle the stream completion
    const streamPromise = new Promise<void>((resolve, reject) => {
      archive.on('data', (data) => {
        output.push(data);
      });
      archive.on('end', resolve);
      archive.on('error', reject);
    });

    const projectRoot = process.cwd();
    const filesToRead = [
      ".env",
      "README.md",
      "apphosting.yaml",
      "components.json",
      "docs/backend.json",
      "firestore.rules",
      "next.config.ts",
      "package.json",
      "src/ai/dev.ts",
      "src/ai/flows/context-aware-detailed-answers.ts",
      "src/ai/flows/display-contextual-images.ts",
      "src/ai/flows/generate-charts-and-graphs.ts",
      "src/ai/flows/generate-downloadable-file.ts",
      "src/ai/genkit.ts",
      "src/app/(auth)/layout.tsx",
      "src/app/(auth)/sign-in/page.tsx",
      "src/app/(auth)/sign-up/page.tsx",
      "src/app/api/chat/route.ts",
      "src/app/chat/layout.tsx",
      "src/app/chat/page.tsx",
      "src/app/globals.css",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/settings/page.tsx",
      "src/components/FirebaseErrorListener.tsx",
      "src/components/chat/chat-input.tsx",
      "src/components/chat/chat-layout.tsx",
      "src/components/chat/chat-messages.tsx",
      "src/components/chat/chat-welcome.tsx",
      "src/components/logo.tsx",
      "src/components/ui/accordion.tsx",
      "src/components/ui/alert-dialog.tsx",
      "src/components/ui/alert.tsx",
      "src/components/ui/avatar.tsx",
      "src/components/ui/badge.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/calendar.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/carousel.tsx",
      "src/components/ui/chart.tsx",
      "src/components/ui/checkbox.tsx",
      "src/components/ui/collapsible.tsx",
      "src/components/ui/dialog.tsx",
      "src/components/ui/dropdown-menu.tsx",
      "src/components/ui/form.tsx",
      "src/components/ui/input.tsx",
      "src/components/ui/label.tsx",
      "src/components/ui/menubar.tsx",
      "src/components/ui/popover.tsx",
      "src/components/ui/progress.tsx",
      "src/components/ui/radio-group.tsx",
      "src/components/ui/scroll-area.tsx",
      "src/components/ui/select.tsx",
      "src/components/ui/separator.tsx",
      "src/components/ui/sheet.tsx",
      "src/components/ui/sidebar.tsx",
      "src/components/ui/skeleton.tsx",
      "src/components/ui/slider.tsx",
      "src/components/ui/switch.tsx",
      "src/components/ui/table.tsx",
      "src/components/ui/tabs.tsx",
      "src/components/ui/textarea.tsx",
      "src/components/ui/toast.tsx",
      "src/components/ui/toaster.tsx",
      "src/components/ui/tooltip.tsx",
      "src/components/user-nav.tsx",
      "src/firebase/client-provider.tsx",
      "src/firebase/config.ts",
      "src/firebase/error-emitter.ts",
      "src/firebase/errors.ts",
      "src/firebase/firestore/use-collection.tsx",
      "src/firebase/firestore/use-doc.tsx",
      "src/firebase/index.ts",
      "src/firebase/non-blocking-login.tsx",
      "src/firebase/non-blocking-updates.tsx",
      "src/firebase/provider.tsx",
      "src/hooks/use-mobile.tsx",
      "src/hooks/use-toast.ts",
      "src/lib/placeholder-images.json",
      "src/lib/placeholder-images.ts",
      "src/lib/utils.ts",
      "tailwind.config.ts",
      "tsconfig.json",
    ];

    for (const filePath of filesToRead) {
      try {
        const fullPath = path.join(projectRoot, filePath);
        const content = await fs.readFile(fullPath);
        archive.append(content, { name: filePath });
      } catch (err) {
        console.warn(`Could not read file: ${filePath}`, err);
      }
    }

    archive.finalize();
    await streamPromise;

    const fileDataBase64 = Buffer.concat(output).toString('base64');

    return {
      fileDataBase64,
      fileType: 'application/zip',
      filename: 'silk-ai-project.zip',
    };
  }
);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  'use server';

  // Check if the request is for a direct download from the landing page button
  const contentType = req.headers.get('content-type');
  if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const downloadAction = formData.get('action');

    if (downloadAction === 'download') {
      const fileData = await getAllProjectFiles({ reason: 'Direct download from button' });
      const buffer = Buffer.from(fileData.fileDataBase64, 'base64');
      
      return new NextResponse(buffer, {
          status: 200,
          headers: {
              'Content-Type': fileData.fileType,
              'Content-Disposition': `attachment; filename="${fileData.filename}"`,
          },
      });
    }
  }

  // Otherwise, handle as a chat message (JSON payload)
  const { messages }: { messages: Message[] } = await req.json();

  const result = await ai.runTool(
    {
        tools: [getAllProjectFiles],
        prompt: `You are an AI assistant. When the user asks to 'download the code' or 'get the source files', use the 'getAllProjectFiles' tool. Do NOT try to write out the code manually.
        
        Current conversation:
        ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
        `,
    },
    {
      // Force the model to use the tool if the user's last message contains "download"
      toolChoice: messages[messages.length-1]?.content.toLowerCase().includes('download') ? 'tool' : 'auto',
    }
  );

  // If the model wants to call our tool
  if (result.isToolRequest()) {
    const toolResponse = await result.toolRequest.next(
      await getAllProjectFiles(result.toolRequest.input)
    );
    // Send the tool's output back as a JSON response
    return NextResponse.json(toolResponse.output.content[0]);
  }

  // Otherwise, it's a standard text response, which should be streamed.
  const stream = new ReadableStream({
      async start(controller) {
          for (const chunk of result.stream) {
              controller.enqueue(chunk.text);
          }
          controller.close();
      }
  });

  return streamToResponse(stream, {
      headers: { 'X-Content-Type-Options': 'nosniff' },
  });
}

    
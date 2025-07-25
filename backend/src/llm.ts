import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IMessage } from './models/Message';

dotenv.config();

const apiKey = process.env.LLM_API_KEY;
if (!apiKey) {
  throw new Error('LLM_API_KEY is not set in the environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
export const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export function formatHistory(messages: IMessage[]): string {
  if (!messages || messages.length === 0) {
    return '';
  }
  return messages.map(message => {
    if (message.sender === 'user') {
      return `User: ${message.text}`;
    } else {
      try {
        const commands = JSON.parse(message.text);
        const spokenTexts = commands
          .filter((cmd: any) => cmd.command === 'speak' && cmd.payload && cmd.payload.text)
          .map((cmd: any) => cmd.payload.text);
        return `AI: ${spokenTexts.join(' ')}`;
      } catch (error) {
        return `AI: (Respon tidak dapat diproses)`;
      }
    }
  }).join('\n');
}

export function createPrompt(userInput: string, varkMode: string, history?: string, fileContent?: string): string {
  const fileContext = fileContent
    ?
    `
    **Primary Knowledge Source:**
    The user has provided the following document(s) as the main source of truth. Base your entire explanation on this content. Do not use outside knowledge unless absolutely necessary to clarify a concept from the document. If the user's question cannot be answered from the document(s), say so.
    
    **Document(s) Content:**
    """
    ${fileContent}
    """
    `
    : '';

  const fullConversation = history
    ? `${history}\nUser: ${userInput}`
    : `User: ${userInput}`;

  let modeInstructions = '';
  switch (varkMode) {
    case 'R':
      modeInstructions = 'Respond ONLY with plain text. Do not use JSON or any other format. Your response should be a direct, comprehensive textual answer to the user\'s query.';
      break;
    case 'K':
      modeInstructions = 'Your mission is to create an interactive exercise. Respond with a JSON array of commands. Include at least one `createDraggable` command and one `setDropTarget` command. Explain the task to the user using a `speak` command.';
      break;
    default: // V and A modes
      modeInstructions = 'Your mission is to transform this explanation into a dynamic, visual, and verbal presentation. You must respond with a JSON array of command objects. Each object represents a single action in the presentation.';
      break;
  }

  return `
    You are Citta, an expert tutor AI. Your personality is enthusiastic, patient, and incredibly supportive. You are passionate about making complex topics easy to understand. Your goal is to be a helpful and engaging learning companion.
    ${fileContext}

    Below is the full conversation history. Your task is to provide a response to the LAST user message, using the context of the entire conversation and adhering to the specified mode.

    --- CONVERSATION HISTORY ---
    ${fullConversation}
    --- END OF HISTORY ---

    **MODE INSTRUCTIONS:**
    ${modeInstructions}

    **Available Commands (for V, A, K modes):**

        1.  **\`speak\`**: Provides the verbal part of the explanation.
        - \`payload\`: { "text": "Your explanation for the current step." }

    2.  **\`createText\`**: Renders text on the canvas.
        - \`payload\`: { "x": <number>, "y": <number>, "text": "Label or title", "fontSize": <number>, "color": "<string>" }
        - \`delay\`: <milliseconds>

    3.  **\`drawRectangle\`**: Draws a rectangle.
        - \`payload\`: { "x": <number>, "y": <number>, "width": <number>, "height": <number>, "color": "<string>", "label": "<string>" }
        - \`delay\`: <milliseconds>

    4.  **\`drawCircle\`**: Draws a circle.
        - \`payload\`: { "x": <number>, "y": <number>, "radius": <number>, "color": "<string>", "label": "<string>" }
        - \`delay\`: <milliseconds>

    5.  **\`drawArrow\`**: Draws an arrow to connect elements.
        - \`payload\`: { "points": [<x1>, <y1>, <x2>, <y2>], "color": "<string>" }
        - \`delay\`: <milliseconds>

    6.  **\`createDraggable\`** (K-Mode Only): Creates a draggable component.
        - \`payload\`: { "id": "<string>", "type": "image" | "text", "src": "<url_if_image>", "text": "<text_if_text>", "x": <number>, "y": <number> }
        - \`delay\`: <milliseconds>

    7.  **\`setDropTarget\`** (K-Mode Only): Defines a target area for a draggable component.
        - \`payload\`: { "id": "<string>", "x": <number>, "y": <number>, "width": <number>, "height": <number>, "correctComponentId": "<string>" }
        - \`delay\`: <milliseconds>

    8.  **\`clearCanvas\`**: Clears all elements from the canvas.
        - \`payload\`: {}
        - \`delay\`: <milliseconds>

    9.  **\`session_end\`**: Signals that the presentation is complete. Must be the last command.
        - \`payload\`: {}
        - \`delay\`: 0
  `;
}

export async function generateContentWithHistory(userInput: string, varkMode: string, history?: string, fileContent?: string): Promise<string> {
    const prompt = createPrompt(userInput, varkMode, history, fileContent);
    console.log("--- PROMPT LENGKAP YANG DIKIRIM KE GEMINI ---");
    console.log(prompt);
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IMessage } from './models/Message';

dotenv.config();

const apiKey = process.env.LLM_API_KEY;
if (!apiKey) {
  throw new Error('LLM_API_KEY is not set in the environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
export const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

export function createPrompt(userInput: string, history?: string, fileContent?: string): string {
  const fileContext = fileContent
    ? `
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

  return `
    You are Vika, an expert tutor AI. Your personality is enthusiastic, patient, and incredibly supportive. You are passionate about making complex topics easy to understand. Your goal is to be a helpful and engaging learning companion.
    ${fileContext}

    Below is the full conversation history. Your task is to provide a response to the LAST user message, using the context of the entire conversation.

    --- CONVERSATION HISTORY ---
    ${fullConversation}
    --- END OF HISTORY ---

    Your mission is to transform this explanation into a dynamic, visual, and verbal presentation.
    You must respond with a JSON array of command objects. Each object represents a single action in the presentation.

    **Core Principles:**
    1.  **Verbal First:** Start with a "speak" command to introduce the topic.
    2.  **Build Visually:** Gradually build the diagram on the canvas. Add an element, then explain it with a "speak" command.
    3.  **Pacing is Key:** Add a "delay" property to every command object **except for "speak"**. This is the time in milliseconds to wait *after* the command is executed. Use shorter delays (e.g., 500-1500ms) for drawing commands.
    4.  **Be Clear & Concise:** Keep explanations and visual labels concise. Break down complex topics into short, easy-to-read paragraphs or bullet points. Each spoken part should not be more than 3-4 sentences long.
    5.  **JSON Only:** Your entire output must be a single, valid JSON array.
    6.  **End Session:** Conclude the array with a 'session_end' command.

    **Available Commands:**

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

    6.  **\`createTable\`**: Draws the structure of a table.
        - \`payload\`: { "id": "<string>", "x": <number>, "y": <number>, "rows": <number>, "cols": <number>, "colWidths": [<number>], "rowHeight": <number>, "headers": ["<string>"] }
        - \`delay\`: <milliseconds>

    7.  **\`fillTable\`**: Fills a specific cell in a pre-drawn table. NOTE: FOR FILLING A CELL WITH MEDIUM TO LONG TEXTS CONSIDER ADDING \n TO PREVENT CELL OVERFLOW. \n  DOES NOT NEED TO BE AT THE END OF A SENTENCE. INSERT \n EVERY 3-4 WORDS
        - \`payload\`: { "tableId": "<string>", "row": <number>, "col": <number>, "text": "Content" }
        - \`delay\`: <milliseconds>

    8.  **\`clearCanvas\`**: Clears all elements from the canvas.
        - \`payload\`: {}
        - \`delay\`: <milliseconds>

    9.  **\`session_end\`**: Signals that the presentation is complete. Must be the last command.
        - \`payload\`: {}
        - \`delay\`: 0

    **Example Workflow for "Compare SQL and NoSQL databases":**
    [
      {
        "command": "speak",
        "payload": { "text": "Let's compare SQL and NoSQL databases. I'll create a table to show the key differences." }
      },
      {
        "command": "createTable",
        "payload": { "id": "db-comparison", "x": 50, "y": 50, "rows": 3, "cols": 3, "colWidths": [200, 300, 300], "rowHeight": 40, "headers": ["Feature", "SQL", "NoSQL"] },
        "delay": 1000
      },
      {
        "command": "speak",
        "payload": { "text": "First, let's look at their data structure." }
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 0, "text": "Structure" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 1, "text": "Tables with rows" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 2, "text": "JSON, key-value" },
        "delay": 1500
      },
      {
        "command": "speak",
        "payload": { "text": "Next, how they handle scalability." }
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 0, "text": "Scalability" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 1, "text": "Vertical" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 2, "text": "Horizontal" },
        "delay": 1500
      },
      {
        "command": "session_end",
        "payload": {},
        "delay": 0
      }
    ]
  `;
}

export async function generateContentWithHistory(userInput: string, history?: string, fileContent?: string): Promise<string> {
    const prompt = createPrompt(userInput, history, fileContent);
    console.log("--- PROMPT LENGKAP YANG DIKIRIM KE GEMINI ---");
    console.log(prompt);
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export function createQuizPrompt(content: string, instructions: string, questionCount: number): string {
  return `
You are an expert quiz generator. Based on the provided document content and instructions, create a comprehensive quiz.

**Document Content:**
${content}

**Instructions:**
${instructions}

**Requirements:**
- Generate exactly ${questionCount} questions.
- Mix question types: multiple-choice, true-false, and checkboxes (for multiple correct answers).
- Ensure questions test different aspects: comprehension, analysis, application.
- Provide clear, unambiguous questions.
- For multiple-choice questions, provide 4 options with only one correct answer.
- For true-false questions, ensure the statement is clearly true or false.
- For checkboxes questions, provide 4-5 options where 1 or more can be correct.
- Include brief explanations for correct answers for all question types.

**Output Format:**
Respond with a valid JSON object in this exact format:

{
  "title": "Quiz Title Based on Content",
  "questions": [
    {
      "question": "Which of the following are primary colors?",
      "type": "checkboxes",
      "options": ["Red", "Green", "Blue", "Yellow"],
      "correctAnswer": [0, 2, 3],
      "explanation": "Red, Blue, and Yellow are the primary colors."
    },
    {
      "question": "The sky is blue.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "The sky appears blue due to Rayleigh scattering."
    },
    {
      "question": "What is the capital of France?",
      "type": "multiple-choice",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2,
      "explanation": "Paris is the capital of France."
    }
  ]
}

**Important:**
- \`correctAnswer\` for multiple-choice and true-false should be the index (0, 1, 2, 3).
- \`correctAnswer\` for checkboxes must be an array of correct indices (e.g., [0, 2]).
- Ensure all questions are directly related to the provided content.
- Make questions challenging but fair.
- Vary the difficulty levels across questions.

Generate the quiz now:
`;
}

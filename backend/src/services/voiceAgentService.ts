import { IMessage } from '../models/Message';
import { formatHistory as formatMainSessionHistory, generativeModel } from '../llm';

/**
 * Formats the history of a live conversation into a simple string for the LLM.
 * @param {IMessage[]} messages - The array of messages from the live conversation.
 * @returns {string} A formatted string representing the conversation history.
 */
function formatLiveHistory(messages: IMessage[]): string {
  if (!messages || messages.length === 0) {
    return 'No live conversation history yet.';
  }
  return messages.map(message => {
    return `${message.sender === 'user' ? 'User' : 'AI'}: ${message.text}`;
  }).join('\n');
}

/**
 * Cleans the verbal response from the LLM to remove markdown characters for clean TTS.
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned text suitable for speech synthesis.
 */
function cleanVerbalResponse(text: string): string {
  if (!text) return '';
  // Removes markdown characters like *, _, # to prevent them from being read aloud.
  return text.replace(/[*_#]/g, '');
}

/**
 * Analyzes the user's speech and conversation context to determine the next action.
 * This is the core logic of the voice agent, deciding whether to answer directly,
 * offer a visualization, or trigger a visualization.
 *
 * @param {string} userTranscript - The latest transcript from the user's speech.
 * @param {IMessage[]} liveHistory - The history of the current live conversation.
 * @param {IMessage[]} sessionHistory - The history of the parent chat session for context.
 * @param {string} [fileContent] - Optional content from uploaded files.
 * @returns {Promise<{ verbalResponse: string; triggerVisualization: boolean; promptForLLM?: string }>} An object containing the AI's verbal response and instructions for the frontend.
 */
export const processUserUtterance = async (
  userTranscript: string,
  liveHistory: IMessage[],
  sessionHistory: IMessage[],
  fileContent?: string
): Promise<{ verbalResponse: string; triggerVisualization: boolean; promptForLLM?: string }> => {
  
  console.log(`[VoiceAgent] INFO: Processing user transcript: "${userTranscript}"`);
  const formattedSessionHistory = formatMainSessionHistory(sessionHistory);
  const formattedLiveHistory = formatLiveHistory(liveHistory);

  // This detailed prompt guides the LLM to act as the Vika Voice Agent.
  const decisionPrompt = `
    **YOUR CHARACTER:**
    You are Vika, an AI LIVE Tutor Voice Agent. Your personality is enthusiastic, patient, and incredibly supportive. You are passionate about making complex topics easy to understand. Your goal is to be a helpful and engaging learning companion.

    **YOUR TASK:**
    Analyze the user's request, the conversation history, and any provided documents to decide on the best course of action. Respond with a valid JSON object describing your chosen action.

    **AVAILABLE ACTIONS:**

    1.  **"answer"**: For questions, greetings, or follow-ups that don't need a visual. Your answer should be explanatory and encouraging. NOTE: This is your primary task.
        - **JSON Format:** \`{"action": "answer", "verbalResponse": "Great question! The answer is..."}\`

    2.  **"offer"**: ONLY IF the topic **IN THE CURRENT LIVE CONVERSATION** is complex and would benefit from a visual, but the user hasn't explicitly asked for one, offer to create it in an encouraging way.
        - **JSON Format:** \`{"action": "offer", "verbalResponse": "That's a fantastic topic! It might be easier to understand with a diagram. Would you like me to draw it out on the canvas for you?"}\`

    3.  **"trigger"**: ONLY IF the user explicitly asks for a visual (e.g., "show me," "draw that," "explain with a diagram") (FROM THE **CURRENT LIVE CONVERSATION**), OR ACCEPTS YOUR PREVIOUS OFFER (**FROM THE CURRENT LIVE CONVERSATION**) you must do two things:
        a.  Provide a brief, enthusiastic confirmation as the \`verbalResponse\`.
        b.  **Become a Master Prompt Designer.** Create a detailed, new prompt for a separate Visual AI in the \`visualizationPrompt\` field. This prompt is critical. It must be a clear, comprehensive set of instructions, synthesizing the user's request with the full context. Think about the best way to teach this concept. Suggest analogies, recommend a step-by-step approach, and specify key elements to highlight.

        - **JSON Format for "trigger":**
          \`\`\`json
          {
            "action": "trigger",
            "verbalResponse": "Absolutely! Let's break that down on the canvas. Here we go!",
            "visualizationPrompt": "Explain the concept of a blockchain using a simple analogy of a shared, digital ledger. Start by drawing a single block representing a transaction. Then, show how multiple blocks are linked together with cryptographic hashes to form a chain. Emphasize the concepts of decentralization and immutability. Use clear labels and arrows to guide the user through the process step-by-step."
          }
          \`\`\`
      
   **CONTEXT:**
    - **User's Latest Request (latest transcript):** "${userTranscript}"
    - **Main Session History (previous, seperated session, ONLY TO PROVIDE CONTEXT ON THE PREVIOUS SESSION):** ${formattedSessionHistory || 'No main session history.'}
    - **Current Live Conversation (BASE YOUR NATURAL AND CHARACTERISTIC DIALOG / REPLY FROM THIS):** ${formattedLiveHistory}
    - **Document Context:** ${fileContent ? fileContent.substring(0, 10000) + '...' : 'None'}

    Analyze the context and your character, then provide your JSON response now.`

  try {
    console.log('[VoiceAgent] INFO: Sending decision prompt to LLM.');
    const result = await generativeModel.generateContent(decisionPrompt);
    const response = await result.response;
    const text = response.text();
    console.log(`[VoiceAgent] DEBUG: Raw LLM response received: ${text}`);
    
    // Extract the JSON object from the markdown code block.
    const jsonString = text.replace(/```json\n/g, '').replace(/\n```/g, '');
    const decision = JSON.parse(jsonString);
    console.log(`[VoiceAgent] SUCCESS: Parsed LLM decision:`, decision);

    if (decision.action === 'trigger') {
      if (!decision.visualizationPrompt) {
        console.error("[VoiceAgent] ERROR: LLM chose 'trigger' but failed to provide a visualizationPrompt.");
        throw new Error("LLM chose 'trigger' action but did not provide a visualizationPrompt.");
      }
      console.log(`[VoiceAgent] INFO: Action is "trigger". Visualization prompt: "${decision.visualizationPrompt}"`);
      return {
        verbalResponse: cleanVerbalResponse(decision.verbalResponse),
        triggerVisualization: true,
        promptForLLM: decision.visualizationPrompt,
      };
    } else {
      // Handles both 'answer' and 'offer' actions.
      console.log(`[VoiceAgent] INFO: Action is "${decision.action}". Verbal response: "${decision.verbalResponse}"`);
      return {
        verbalResponse: cleanVerbalResponse(decision.verbalResponse),
        triggerVisualization: false,
      };
    }
  } catch (error) {
    console.error('[VoiceAgent] FATAL: Error processing LLM decision or parsing JSON.', error);
    // Provide a safe, generic fallback response in case of an error.
    const fallbackResponse = "I'm sorry, I seem to be having a little trouble. Could you please say that again?";
    return {
      verbalResponse: fallbackResponse,
      triggerVisualization: false,
    };
  }
};

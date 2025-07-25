import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';

dotenv.config();

// Creates a client for the Google Cloud Text-to-Speech API.
const ttsClient = new TextToSpeechClient();

/**
 * Synthesizes speech from the provided text using Google Cloud Text-to-Speech.
 * It dynamically selects the voice based on the provided language code.
 * 
 * @param {string} text The text to be converted to speech.
 * @param {string} languageCode The BCP-47 language code (e.g., 'id-ID', 'en-US').
 * @returns {Promise<string>} A promise that resolves with the base64-encoded audio content.
 * @throws Will throw an error if the API call fails or returns no audio content.
 */
export const synthesizeSpeech = async (text: string, languageCode: string = 'en-US'): Promise<string> => {
  console.log(`[ttsService] INFO: Attempting to synthesize speech for text: "${text}" with language: ${languageCode}`);
  
  // Dynamically select a high-definition Chirp voice based on the language.
  const voiceName = languageCode === 'id-ID' 
    ? 'id-ID-Chirp3-HD-Despina' 
    : 'en-US-Chirp3-HD-Despina';

  const request = {
    input: { text: text },
    voice: { languageCode: languageCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3' as const },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    if (!response.audioContent) {
      console.error('[ttsService] ERROR: Google API returned a response but audioContent is null or undefined.');
      throw new Error('Audio content is null or undefined.');
    }
    
    // The audio content is returned as a Buffer, which we convert to a base64 string.
    const audioBase64 = (response.audioContent as Buffer).toString('base64');
    console.log(`[ttsService] SUCCESS: Successfully synthesized speech. Audio size (Base64): ${audioBase64.length} characters.`);
    
    return audioBase64;
  } catch (error) {
    console.error('[ttsService] FATAL: Full error from Google Cloud TTS API:', error);
    throw new Error('Failed to synthesize speech.');
  }
};

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';

dotenv.config();

const ttsClient = new TextToSpeechClient();

export const synthesizeSpeech = async (text: string): Promise<string> => {
  const languageCode = 'en-US';
  console.log(`[ttsService] INFO: Attempting to synthesize speech for text: "${text}" with language: ${languageCode}`);
  
  const voiceName = 'en-US-Standard-C';

  const request = {
    input: { text: text },
    voice: { languageCode: languageCode, name: voiceName, ssmlGender: 'FEMALE' as const },
    audioConfig: { audioEncoding: 'MP3' as const },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    if (!response.audioContent) {
      console.error('[ttsService] ERROR: Google API returned a response but audioContent is null or undefined.');
      throw new Error('Audio content is null or undefined.');
    }
    
    const audioBase64 = (response.audioContent as Buffer).toString('base64');
    console.log(`[ttsService] SUCCESS: Successfully synthesized speech. Audio size (Base64): ${audioBase64.length} characters.`);
    
    return audioBase64;
  } catch (error) {
    console.error('[ttsService] FATAL: Full error from Google Cloud TTS API:', error);
    throw new Error('Failed to synthesize speech.');
  }
};
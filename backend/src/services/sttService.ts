import { SpeechClient } from '@google-cloud/speech';

// Configure the Google Cloud Speech-to-Text client.
const speechClient = new SpeechClient();

/**
 * Creates and manages a writable stream for real-time speech recognition.
 * This function sets up a connection to the Google Cloud Speech-to-Text API
 * and returns a stream that can be written to with audio chunks.
 * 
 * @param onData - Callback function invoked when a new transcript is available.
 * @param onError - Callback function invoked when a stream error occurs.
 * @param onEnd - Callback function invoked when the stream is closed.
 * @param languageCode - The BCP-47 language code for speech recognition (e.g., 'en-US', 'id-ID').
 * @returns A `RecognizeStream` object which is a writable stream.
 */
export const createSpeechStream = (
  onData: (data: any) => void,
  onError: (error: Error) => void,
  onEnd: () => void,
  languageCode: string = 'en-US' // Default to English
) => {
  const recognitionConfig = {
    config: {
      encoding: 'WEBM_OPUS' as const, // The audio encoding from the client.
      sampleRateHertz: 48000, // The sample rate of the audio.
      languageCode: languageCode, // Use the dynamic language code.
      model: 'default', // The recognition model to use.
      enableAutomaticPunctuation: true, // Automatically add punctuation.
    },
    interimResults: true, // Get intermediate results for faster feedback.
  };

  console.log(`[sttService] INFO: Creating new speech stream with config:`, JSON.stringify(recognitionConfig, null, 2));

  const recognizeStream = speechClient
    .streamingRecognize(recognitionConfig)
    .on('error', onError)
    .on('data', onData)
    .on('end', onEnd);

  return recognizeStream;
};

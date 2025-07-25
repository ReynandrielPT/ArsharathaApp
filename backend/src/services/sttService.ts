import { SpeechClient } from '@google-cloud/speech';

const speechClient = new SpeechClient();

export const createSpeechStream = (
  onData: (data: any) => void,
  onError: (error: Error) => void,
  onEnd: () => void
) => {
  const recognitionConfig = {
    config: {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      model: 'default',
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
  };

  console.log(`[sttService] INFO: Creating new speech stream with config:`, JSON.stringify(recognitionConfig, null, 2));

  const recognizeStream = speechClient
    .streamingRecognize(recognitionConfig)
    .on('error', onError)
    .on('data', onData)
    .on('end', onEnd);

  return recognizeStream;
};
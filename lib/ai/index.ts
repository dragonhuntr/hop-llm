import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { openai } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

const litellm = createOpenAICompatible({
  name: 'litellm',
  baseURL: process.env.LITELLM_ENDPOINT,
  fetch: async (url, request) => {
    return await fetch(url, { ...request });
  },
});

const getModelProvider = (apiIdentifier: string) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.length > 0) {
    return openai(apiIdentifier);
  }
  return litellm(apiIdentifier);
};

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: getModelProvider(apiIdentifier),
    middleware: customMiddleware,
  });
};
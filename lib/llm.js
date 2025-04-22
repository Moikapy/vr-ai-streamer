// lib/llm.js
import {ChatAnthropic} from '@langchain/anthropic';
import {ChatXAI} from '@langchain/xai';
import {ChatOllama} from '@langchain/ollama';

export function getLLM(provider = 'anthropic') {
  if (
    provider === 'anthropic' ||
    (process.env.ANTHROPIC_API_KEY && !provider)
  ) {
    return new ChatAnthropic({
      anthropicApiKey: Bun.env.ANTHROPIC_API_KEY,
      model: Bun.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 1024,
    });
  } else if (provider === 'xai' || (process.env.XAI_API_KEY && !provider)) {
    return new ChatXAI({
      xaiApiKey: process.env.XAI_API_KEY,
      model: process.env.XAI_MODEL || 'grok-beta',
      temperature: 0.7,
      maxTokens: 1024,
    });
  } else if (provider === 'ollama' || (process.env.OLLAMA_HOST && !provider)) {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_HOST,
      model: process.env.OLLAMA_MODEL || 'llama3',
      temperature: 0.7,
      maxTokens: 1024,
    });
  } else {
    throw new Error(
      'No valid provider configured. Please set ANTHROPIC_API_KEY, XAI_API_KEY, or OLLAMA_HOST.'
    );
  }
}

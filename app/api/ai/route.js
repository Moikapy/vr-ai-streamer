// app/api/ai/route.js
import {getLLM} from '@/lib/llm';

export async function POST(req) {
  try {
    const {prompt, provider} = await req.json();
    if (!prompt) {
      return Response.json({error: 'Prompt is required'}, {status: 400});
    }
    console.log('Thinking about:', prompt[0]);
    if (!prompt.startsWith('>') || prompt[0] !== '>') return;
    const llm = getLLM(provider);
    const response = await llm.invoke(prompt);
    return Response.json({
      response: response.content,
      provider: llm.constructor.name,
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return Response.json(
      {error: 'Failed to generate response: ' + error.message},
      {status: 500}
    );
  }
}

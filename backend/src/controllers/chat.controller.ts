import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const SYSTEM_PROMPT = `You are AgriBot, an expert agricultural assistant specializing in Indian farming. Answer the user's question about farming, crops, or diseases concisely.`;

export const chatWithBot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      throw createError('Messages array is required.', 400);
    }

    const lastMessage = messages[messages.length - 1].content;
    const prompt = `System: ${SYSTEM_PROMPT}\nUser: ${lastMessage}\nAgriBot:`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      { inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.7 } },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    let reply = response.data[0]?.generated_text || 'I could not process your request.';
    reply = reply.replace(prompt, '').trim();

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const SYSTEM_PROMPT = `You are AgriBot, an expert agricultural assistant specializing in Indian farming. Answer the user's question about farming, crops, or diseases concisely.`;

const offlineReply = (message: string) => {
  const lower = message.toLowerCase();

  if (lower.includes('disease') || lower.includes('leaf') || lower.includes('spot')) {
    return 'For crop disease issues, upload a clear leaf photo in Disease Detection. Meanwhile, isolate affected plants, avoid overhead watering, remove badly infected leaves, and use neem oil or a suitable fungicide based on the crop and disease.';
  }

  if (lower.includes('fertilizer') || lower.includes('npk') || lower.includes('soil')) {
    return 'Start with a soil test, then balance NPK based on crop stage. Use compost or farmyard manure for soil structure, apply nitrogen in split doses, and avoid over-fertilizing before heavy rain.';
  }

  if (lower.includes('yield') || lower.includes('production')) {
    return 'For better yield, use certified seed, choose the right sowing window, maintain plant spacing, manage irrigation at flowering/grain-filling stages, and track local historical yield trends in Yield Analytics.';
  }

  return 'I can help with crop selection, disease symptoms, fertilizers, irrigation, marketplace listings, and yield planning. Tell me your crop, location, season, and the problem you are seeing.';
};

export const chatWithBot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      throw createError('Messages array is required.', 400);
    }

    const lastMessage = messages[messages.length - 1].content;
    const prompt = `System: ${SYSTEM_PROMPT}\nUser: ${lastMessage}\nAgriBot:`;

    let reply: string;

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
        { inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.7 } },
        { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }, timeout: 15000 }
      );

      reply = response.data[0]?.generated_text || '';
      reply = reply.replace(prompt, '').trim() || offlineReply(lastMessage);
    } catch {
      reply = offlineReply(lastMessage);
    }

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

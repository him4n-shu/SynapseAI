import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test OpenAI connection
export const testOpenAIConnection = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    });
    console.log('✅ OpenAI API connected successfully');
    return true;
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    return false;
  }
};

export default openai;


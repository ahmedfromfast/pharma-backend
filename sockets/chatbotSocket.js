const { OpenAI } = require('openai');
const ChatLog = require('../models/chatlog');
const mongoose = require('mongoose');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initialSuggestions = [
  "What are the common side effects of this medication?",
  "How should I take this medicine?",
  "Are there any drug interactions I should know about?",
  "What are the alternatives to this medication?",
  "How long does it take for this medicine to work?"
];

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial message with suggestions
    socket.emit('botReply', {
      message: "Hello, I'm Pharma Care bot, How may I help you?",
      suggestions: initialSuggestions
    });

    socket.on('userMessage', async ({ userId, message }) => {
      try {
        // Get main response
        const gptResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful pharmacy assistant. Provide a clear, concise answer to the user's question about medications, health conditions, or pharmacy services. Keep your response focused and professional.`
            },
            { role: 'user', content: message }
          ]
        });

        const mainResponse = gptResponse.choices[0].message.content;

        // Get suggestions
        const suggestionsResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Based on the user's question and your response, generate exactly 3 short, relevant follow-up questions that a user might logically ask next. Format each question on a new line with a number (1., 2., 3.).`
            },
            { role: 'user', content: `User question: ${message}\nYour response: ${mainResponse}\n\nGenerate 3 follow-up questions:` }
          ]
        });

        // Parse suggestions
        const suggestionsText = suggestionsResponse.choices[0].message.content;
        const suggestions = suggestionsText
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 3); // Ensure we only take 3 suggestions

        // Emit back to client with both response and suggestions
        socket.emit('botReply', {
          message: mainResponse,
          suggestions: suggestions
        });

        // Only save to MongoDB if userId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(userId)) {
          await ChatLog.create({
            userId: new mongoose.Types.ObjectId(userId),
            userQuery: message,
            botResponse: mainResponse,
            suggestions: suggestions
          });
        }

      } catch (error) {
        console.error('Error with GPT:', error.message);
        socket.emit('botReply', {
          message: "I'm having trouble processing your request. Please try again.",
          suggestions: []
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI
const ai = new GoogleGenAI({});

// Store chat histories per session
const chatHistories = new Map();

// Function to transform query using chat history
async function transformQuery(question, sessionId) {
  const history = chatHistories.get(sessionId) || [];
  
  history.push({
    role: 'user',
    parts: [{ text: question }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: history,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
      Only output the rewritten question and nothing else.`,
    },
  });

  history.pop();
  return response.text;
}

// Function to handle RAG query
async function handleQuery(question, sessionId) {
  try {
    // Transform query using chat history
    const transformedQuery = await transformQuery(question, sessionId);

    // Convert question to vector
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    });

    const queryVector = await embeddings.embedQuery(transformedQuery);

    // Connect to Pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true,
    });

    // Create context from search results
    const context = searchResults.matches
      .map(match => match.metadata.text)
      .join("\n\n---\n\n");

    // Get or create chat history for this session
    const history = chatHistories.get(sessionId) || [];
    
    history.push({
      role: 'user',
      parts: [{ text: transformedQuery }]
    });

    // Generate response using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: history,
      config: {
        systemInstruction: `You are a Data Structure and Algorithm Expert.
        You will be given a context of relevant information and a user question.
        Your task is to answer the user's question based ONLY on the provided context.
        If the answer is not in the context, you must say "I could not find the answer in the provided document."
        Keep your answers clear, concise, and educational.
        
        IMPORTANT: When providing code or algorithms, ALWAYS format them using markdown code blocks:
        - Use triple backticks (\`\`\`) to wrap code blocks
        - Use single backticks (\`) for inline code
        - Example: \`\`\`\nalgorithm Example()\n  // code here\nend\`\`\`
        
        Context: ${context}`,
      },
    });

    // Update chat history
    history.push({
      role: 'model',
      parts: [{ text: response.text }]
    });
    
    chatHistories.set(sessionId, history);

    return {
      success: true,
      answer: response.text
    };
  } catch (error) {
    console.error('Error handling query:', error);
    return { success: false, error: error.message };
  }
}

// Single Chat Endpoint 
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    console.log(`📝 New message from session ${sessionId}: ${message}`);
    
    const result = await handleQuery(message, sessionId);
    
    if (result.success) {
      console.log(`✅ Response sent to session ${sessionId}`);
      res.json({
        success: true,
        response: result.answer
      });
    } else {
      console.log(`❌ Error for session ${sessionId}: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chat API is running',
    endpoint: 'POST /chat'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found. Use POST /chat to send messages.' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chat API Server running on port ${PORT}`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`🔍 Health check: GET http://localhost:${PORT}/health`);
  console.log(`\n📋 Usage:`);
  console.log(`   Send POST request to /chat with:`);
  console.log(`   { "message": "Your question here", "sessionId": "optional" }`);
});

export default app;

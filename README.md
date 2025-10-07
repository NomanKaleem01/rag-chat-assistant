# 🤖 RAG Chat Assistant

A Retrieval-Augmented Generation (RAG) implementation with a ChatGPT-like interface for querying Data Structures and Algorithms documents.

## 🚀 Features

- **💬 ChatGPT-like UI** - Modern, responsive chat interface with dark theme
- **🧠 RAG Implementation** - Retrieval-Augmented Generation for accurate, context-aware answers
- **📚 Document Indexing** - PDF document processing with Pinecone vector database
- **📱 Mobile Responsive** - Perfect experience on desktop and mobile devices
- **🎨 Code Formatting** - Beautiful syntax highlighting for algorithms and code
- **💾 Session Management** - Persistent chat history with sidebar navigation
- **🔄 Real-time Chat** - Interactive Q&A with loading animations
- **📖 Algorithm Support** - Specialized for Data Structures and Algorithms content

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **AI Model** | Google Gemini AI (Gemini 2.0 Flash) |
| **Vector Database** | Pinecone |
| **Document Processing** | LangChain |
| **PDF Processing** | PDFLoader |
| **Text Splitting** | RecursiveCharacterTextSplitter |
| **Styling** | Custom CSS with ChatGPT-inspired design |


## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rag-chat-assistant.git
cd rag-chat-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here

# Text Chunking Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Server Configuration
PORT=3000
```

Open `chatgpt-ui.html` in your browser and start chatting!

## 📁 Project Structure

```
rag-chat-assistant/
├── 📄 chatgpt-ui.html          # ChatGPT-like frontend interface
├── 🖥️ server.js                # Express.js API server
├── 📚 index.js                 # Document indexing script
├── 💻 query.js                 # Command-line query interface (legacy)
├── 📦 package.json             # Dependencies and scripts
├── 🚫 .gitignore               # Git ignore rules
├── 📖 README.md                # This file
└── 📄 dsa.pdf                  # Your document to query
```

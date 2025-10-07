import * as dotenv from 'dotenv';
dotenv.config();
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

// Function to load, split, embed, and index the PDF document
async function indexDocument() {
  const PDF_PATH = './dsa.pdf';
  const pdfLoader = new PDFLoader(PDF_PATH);
  const rawDocs = await pdfLoader.load();
  console.log('PDF loaded successfully');

  // Split the document into smaller chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: parseInt(process.env.CHUNK_SIZE) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 200,
  });
  const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
  console.log('Document split into chunks successfully');

  // Initialize the embeddings model
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
  console.log('Embeddings model initialized successfully');

  // Initialize Pinecone
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  console.log('Pinecone index initialized successfully');

  // Index documents in Pinecone
  await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
  console.log('Documents indexed in Pinecone successfully');
}

indexDocument();
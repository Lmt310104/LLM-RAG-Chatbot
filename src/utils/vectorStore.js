const { QdrantVectorStore } = require("@langchain/qdrant");
const { QdrantClient } = require("@qdrant/js-client-rest");
require("dotenv").config();
const embeddings = require("./embedding");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

let vectorStore = null;
let retriever = null;

(async () => {
  if (retriever) return;
  vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: process.env.COLLECTION_NAME,
    apiKey: process.env.QDRANT_API_KEY,
  });
  retriever = vectorStore.asRetriever();
})();

const getRetriever = () => {};

module.exports = { client, vectorStore, retriever, getRetriever };

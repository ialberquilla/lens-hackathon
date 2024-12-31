const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ollama = require('ollama');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Embeddings endpoint
app.post('/api/embeddings', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Create Ollama client with the correct host
    const client = new ollama.Client({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    });

    // Generate embeddings using embed method
    const response = await client.embed({
      model: 'mxbai-embed-large',
      prompt: text,
    });

    res.json({ embedding: response });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 
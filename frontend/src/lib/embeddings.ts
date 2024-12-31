const EMBEDDINGS_API = process.env.NEXT_PUBLIC_EMBEDDINGS_API || 'http://localhost:3001';

export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    console.log('Sending request to:', `${EMBEDDINGS_API}/api/embeddings`);
    console.log('Request payload:', { text });

    const response = await fetch(`${EMBEDDINGS_API}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', result);

    if (!result.embeddings || !Array.isArray(result.embeddings)) {
      console.error('Invalid embedding format:', result);
      throw new Error('Invalid embedding format in response');
    }

    return result.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
} 
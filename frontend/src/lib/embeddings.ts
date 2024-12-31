const EMBEDDINGS_API = process.env.NEXT_PUBLIC_EMBEDDINGS_API || 'http://localhost:3002';

export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${EMBEDDINGS_API}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
} 
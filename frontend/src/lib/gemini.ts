import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeImage(file: File) {
  try {
    // Convert File to base64
    const base64Image = await fileToBase64(file);

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Generate content
    const result = await model.generateContent([
      'Analyze this image and provide a concise response in the following format:\n\nCategory: [one or two words describing the type of artwork]\n\nDescription: [2-3 sentences describing the main elements]\n\nStyle: [1-2 sentences about artistic style]\n\nUse Cases: [2-3 key potential uses, comma separated]',
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
} 
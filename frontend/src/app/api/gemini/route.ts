import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert File to Buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create base64 data URL for the image
    const base64Image = buffer.toString('base64');

    // Analyze the image with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent([
      'Analyze this image and provide a concise response in the following format:\n\nCategory: [one or two words describing the type of artwork]\n\nDescription: [2-3 sentences describing the main elements]\n\nStyle: [1-2 sentences about artistic style]\n\nUse Cases: [2-3 key potential uses, comma separated]',
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type
        },
      },
    ]);

    const response = await result.response;
    
    return NextResponse.json({
      success: true,
      analysis: response.text(),
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
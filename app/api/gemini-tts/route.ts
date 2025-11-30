import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, apiKey, voice, accent, mood, tone } = body;

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: "Text and API key are required" },
        { status: 400 }
      );
    }

    // Build elaborate style instructions for accent, mood, and tone
    // Voice is handled separately via voiceConfig
    const styleParts: string[] = [];
    
    // Elaborate accent description
    if (accent) {
      const accentDescriptions: Record<string, string> = {
        "american": "a clear American accent with natural pronunciation",
        "british": "a refined British accent with proper enunciation",
        "australian": "a distinctive Australian accent with characteristic vowel sounds",
        "canadian": "a Canadian accent with subtle regional variations",
        "indian": "an Indian accent with melodic intonation patterns",
        "jamaican": "a vibrant Jamaican accent with rhythmic cadence",
        "irish": "a charming Irish accent with lyrical quality",
        "scottish": "a strong Scottish accent with distinctive rolling r's",
        "south-african": "a South African accent with unique vowel pronunciations",
        "new-zealand": "a New Zealand accent with distinctive vowel shifts",
        "spanish": "a Spanish accent with characteristic pronunciation",
        "french": "a French accent with elegant pronunciation",
        "german": "a German accent with precise articulation",
        "italian": "an Italian accent with expressive intonation",
      };
      styleParts.push(accentDescriptions[accent] || `a ${accent} accent`);
    }
    
    // Elaborate mood description
    if (mood) {
      const moodDescriptions: Record<string, string> = {
        "neutral": "a neutral, balanced emotional state",
        "happy": "a joyful and upbeat emotional state with positive energy",
        "sad": "a melancholic and somber emotional state with gentle expression",
        "excited": "an enthusiastic and energetic emotional state with high energy",
        "calm": "a peaceful and serene emotional state with relaxed delivery",
        "energetic": "a dynamic and lively emotional state with vibrant energy",
        "melancholic": "a deeply reflective and wistful emotional state",
        "cheerful": "a bright and optimistic emotional state with warmth",
        "serious": "a focused and earnest emotional state with gravitas",
        "playful": "a lighthearted and fun emotional state with whimsy",
        "romantic": "a tender and affectionate emotional state with warmth",
        "nostalgic": "a wistful and sentimental emotional state with longing",
        "confident": "a self-assured and bold emotional state with conviction",
        "anxious": "a nervous and worried emotional state with tension",
        "relaxed": "a laid-back and easygoing emotional state with ease",
        "passionate": "an intense and fervent emotional state with strong feeling",
        "mysterious": "an enigmatic and intriguing emotional state with subtlety",
        "optimistic": "a hopeful and positive emotional state with brightness",
        "pessimistic": "a cautious and skeptical emotional state with reservation",
        "grateful": "a thankful and appreciative emotional state with warmth",
        "apologetic": "a remorseful and contrite emotional state with sincerity",
      };
      styleParts.push(moodDescriptions[mood] || `a ${mood} mood`);
    }
    
    // Elaborate tone description
    if (tone) {
      const toneDescriptions: Record<string, string> = {
        "conversational": "a natural, conversational tone as if speaking to a friend",
        "formal": "a professional and formal tone with proper etiquette",
        "casual": "a relaxed and informal tone with friendly familiarity",
        "friendly": "a warm and approachable tone with genuine friendliness",
        "professional": "a polished and business-like tone with authority",
      };
      styleParts.push(toneDescriptions[tone] || `a ${tone} tone`);
    }

    // Construct an elaborate prompt that fully utilizes all style parameters
    let prompt = text;
    if (styleParts.length > 0) {
      const styleDescription = styleParts.join(", with ");
      prompt = `Read this text aloud with ${styleDescription}: "${text}"`;
    }

    // Call Gemini 2.5 Flash Preview TTS API
    // According to: https://ai.google.dev/gemini-api/docs/speech-generation#javascript
    // Model: gemini-2.5-flash-preview-tts (faster and more cost-effective)
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || "Zephyr", // Use exact voice name from API
            },
          },
        },
      },
    };

    console.log("Gemini TTS Request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorJson.error?.message || "Failed to generate audio", details: errorJson },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: "Failed to generate audio", details: errorText },
          { status: response.status }
        );
      }
    }

    // Parse JSON response - Gemini TTS returns audio as base64 PCM data
    // According to docs: https://ai.google.dev/gemini-api/docs/speech-generation#javascript
    // Response format: data.candidates[0].content.parts[0].inlineData.data (base64 PCM)
    const data = await response.json();
    
    console.log("Gemini TTS Response structure:", JSON.stringify(data, null, 2).substring(0, 500));
    
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const audioPart = data.candidates[0].content.parts.find(
        (part: any) => part.inlineData?.mimeType?.startsWith("audio/")
      );
      
      console.log("Audio part found:", !!audioPart, audioPart ? "Has data: " + !!audioPart.inlineData?.data : "No audio part");
      
      if (audioPart?.inlineData?.data) {
        // Audio is returned as base64-encoded PCM (s16le, 24000 Hz, mono)
        // We need to convert PCM to a usable format (MP3/WAV)
        // For now, we'll create a simple WAV file from the PCM data
        const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
        
        // Create WAV file header
        const sampleRate = 24000;
        const channels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * channels * (bitsPerSample / 8);
        const blockAlign = channels * (bitsPerSample / 8);
        const dataSize = pcmBuffer.length;
        const fileSize = 36 + dataSize;
        
        const wavHeader = Buffer.alloc(44);
        wavHeader.write("RIFF", 0);
        wavHeader.writeUInt32LE(fileSize, 4);
        wavHeader.write("WAVE", 8);
        wavHeader.write("fmt ", 12);
        wavHeader.writeUInt32LE(16, 16); // fmt chunk size
        wavHeader.writeUInt16LE(1, 20); // audio format (PCM)
        wavHeader.writeUInt16LE(channels, 22);
        wavHeader.writeUInt32LE(sampleRate, 24);
        wavHeader.writeUInt32LE(byteRate, 28);
        wavHeader.writeUInt16LE(blockAlign, 32);
        wavHeader.writeUInt16LE(bitsPerSample, 34);
        wavHeader.write("data", 36);
        wavHeader.writeUInt32LE(dataSize, 40);
        
        // Combine WAV header + PCM data
        const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
        
        return new NextResponse(wavBuffer, {
          headers: {
            "Content-Type": "audio/wav",
          },
        });
      }
    }

    return NextResponse.json(
      { error: "No audio data received from Gemini API" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error generating TTS:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


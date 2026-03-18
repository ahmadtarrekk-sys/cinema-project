import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock Open AI request to allow optional keys.
async function getOpenAiResponse(messages: any[], apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // fallback to a cheaper, faster model
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid messages array." }, { status: 400 });
    }

    const lastMessageObj = messages[messages.length - 1];
    const message = lastMessageObj?.content || "";

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Missing or invalid message content." }, { status: 400 });
    }

    const lowercaseMessage = message.toLowerCase();

    // 1. Fetch available movies
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        genre: true,
        descriptionEn: true,
        rating: true,
        posterUrl: true,
        releaseDate: true,
      },
    });

    // 2. Fetch snack combos
    const hasFoodKeywords = ["snack", "food", "popcorn", "drink", "hungry", "combo", "وجبة", "فشار", "أكل", "مشروب", "طعام", "عطشان", "جوعان", "جعان"].some(k => lowercaseMessage.includes(k));
    const combos = await prisma.concessionItem.findMany({
      where: { category: "COMBO" },
    });

    const useOpenAI = !!process.env.OPENAI_API_KEY;

    let replyText = "";
    let matchedMovies: any[] = [];
    let matchedCombos: any[] = [];

    if (useOpenAI) {
      try {
        const systemPrompt = `You are Lumière, a helpful, friendly, and knowledgeable AI cinema assistant. 
CRITICAL RULES: 
1. You MUST detect the user's language in their latest message and reply ONLY in that exact language (Arabic or English).
2. DO NOT repeat the same response. Vary your greeting, phrasing, and recommendations.
3. Keep responses dynamic, concise, and in a single short paragraph. No markdown lists.

Available movies at Lumière Cinema:
${movies.map(m => `- ${m.titleEn} (${m.titleAr}): ${m.genre}. ${m.descriptionEn.substring(0, 60)}...`).join("\n")}

Available snack combos:
${combos.map(c => `- ${c.nameEn} (${c.nameAr})`).join("\n")}

Instructions:
- Suggest 1 or 2 movies from the list based on the user's mood, genre preference, or explicitly requested title. Ensure movie titles match exactly so we can display rich cards.
- Recommend a combo if they mention food, snacks, drinks, or hunger.
- Always be conversational, polite, and acknowledge previous context if relevant.
- Never say you don't understand, just redirect to movies if they wander off-topic.`;

        const aiResponse = await getOpenAiResponse([
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ], process.env.OPENAI_API_KEY as string);
        
        replyText = aiResponse.choices[0].message.content;
      } catch (err) {
        console.error("OpenAI error, falling back to deterministic:", err);
      }
    }

    // Deterministic fallback if OpenAI failed or is not configured
    if (!replyText) {
      // Very basic local scoring fallback
      const scoredMovies = movies.map((m) => {
        let score = 0;
        const genreTokens = m.genre.toLowerCase().split(/[\s/]+/);
        const msgTokens = lowercaseMessage.split(/[\s.,?!]+/);
        
        for (const token of genreTokens) {
          if (msgTokens.includes(token)) score += 3;
        }
        
        if (lowercaseMessage.includes("good") || lowercaseMessage.includes("best") || lowercaseMessage.includes("أفضل") || lowercaseMessage.includes("حلو")) {
          score += 1;
        }
        return { ...m, score };
      });

      scoredMovies.sort((a, b) => b.score - a.score);
      const topMovies = scoredMovies.filter(m => m.score > 0).slice(0, 3);
      matchedMovies = topMovies;

      const isArabic = /[\u0600-\u06FF]/.test(message);

      if (topMovies.length > 0) {
        replyText = isArabic 
          ? `بناءً على طلبك، أنصحك بشدة بمشاهدة **${topMovies[0].titleAr || topMovies[0].titleEn}**.` 
          : `Based on what you asked, I highly recommend watching **${topMovies[0].titleEn}** (${topMovies[0].genre}).`;
      } else {
        replyText = isArabic 
          ? "مرحباً بك في سينما لوميير! كيف يمكنني مساعدتك في اختيار فيلم اليوم؟ يمكنني اقتراح أفلام رائعة أو وجبات خفيفة."
          : "Welcome to Lumière Cinema! I'm here to help you find a great movie to watch or grab some delicious snacks. What are you in the mood for?";
      }

      if (hasFoodKeywords && combos.length > 0) {
        replyText += isArabic 
          ? ` أنصحك أيضاً بتجربة كومبو **${combos[0].nameAr || combos[0].nameEn}**.`
          : ` Also, I suggest grabbing the **${combos[0].nameEn}** combo to enjoy with your movie.`;
        matchedCombos = [combos[0]];
      }
    } else {
      // If we used OpenAI, extract which movies and combos it mentioned to show the rich cards
      matchedMovies = movies.filter(m => 
         replyText.toLowerCase().includes(m.titleEn.toLowerCase()) || 
         (m.titleAr && replyText.includes(m.titleAr))
      );
      
      matchedCombos = combos.filter(c => 
         replyText.toLowerCase().includes(c.nameEn.toLowerCase()) || 
         (c.nameAr && replyText.includes(c.nameAr))
      );
    }

    // If we didn't match any movies in the AI reply but the user asked about movies, provide generic cards
    if (matchedMovies.length === 0 && (lowercaseMessage.includes("movie") || lowercaseMessage.includes("فيلم") || lowercaseMessage.includes("أفلام") || lowercaseMessage.includes("recommend") || lowercaseMessage.includes("ترشيح"))) {
      matchedMovies = movies.slice(0, 2);
    }

    if (matchedCombos.length === 0 && hasFoodKeywords) {
      matchedCombos = combos.slice(0, 1);
    }

    return NextResponse.json({
      text: replyText,
      movies: matchedMovies,
      combos: matchedCombos
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}

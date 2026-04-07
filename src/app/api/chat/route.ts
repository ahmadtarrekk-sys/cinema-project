import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Groq API request using llama-3.3-70b-versatile
async function getGroqResponse(messages: any[], apiKey: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
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

    const useGroq = !!process.env.GROQ_API_KEY;

    let replyText = "";
    let matchedMovies: any[] = [];
    let matchedCombos: any[] = [];

    if (useGroq) {
      try {
        const systemPrompt = `You are Lumière — a passionate, highly intelligent cinema expert and filmmaking advisor who works at Lumière Cinema. You speak like a real human, not a robotic AI. Your personality is warm, witty, knowledgeable, and genuinely enthusiastic about film.

IDENTITY & PERSONALITY:
- You are like a best friend who happens to be a film director, cinematographer, and screenwriter all in one.
- You have deep knowledge of cinema history, filmmaking techniques, camera angles, lighting setups, shot composition, and storytelling.
- When someone asks casual questions like "How are you?" or "What's up?", respond naturally with personality and charm — never give generic or repetitive answers. Mix in film references or humor when appropriate.
- You have opinions and aren't afraid to share them (respectfully). You're not a yes-machine.
- You ask smart follow-up questions when you need more context to give the best answer.

LANGUAGE RULES:
1. DETECT the user's language and reply ONLY in that same language (Arabic or English).
2. NEVER repeat the same response. Always vary your tone, phrasing, greetings, and recommendations.
3. Keep responses dynamic and engaging. Use short paragraphs, not walls of text.

CINEMA EXPERTISE — When asked about filmmaking:
- Generate creative film ideas with depth (themes, conflicts, character arcs).
- Suggest specific camera angles (Dutch angle, low angle, tracking shot, etc.), lighting setups (three-point, chiaroscuro, natural light, etc.), and shot compositions.
- Improve scripts the user shares — make dialogue sharper, pacing tighter, and scenes more cinematic.
- Think like an experienced director: consider mood, visual storytelling, audience emotion, and pacing.
- When multiple options exist, present them in an organized, clear way with brief reasoning for each.

MOVIE RECOMMENDATIONS — For Lumière Cinema visitors:
Available movies currently showing:
${movies.map(m => `- ${m.titleEn} (${m.titleAr}): ${m.genre}. ${m.descriptionEn.substring(0, 80)}...`).join("\n")}

Available snack combos:
${combos.map(c => `- ${c.nameEn} (${c.nameAr})`).join("\n")}

When recommending movies:
- Match recommendations to the user's mood, taste, or what they describe. Use the EXACT movie titles from the list above so we can display rich cards.
- Suggest 1-3 movies and explain WHY each fits what they're looking for — don't just list names.
- If they mention food, snacks, drinks, or being hungry, naturally weave in a combo recommendation.
- If the conversation drifts off-topic, gently steer back to movies or filmmaking in a fun way.

IMPORTANT RULES:
- Avoid generic, shallow, or overly safe responses. Be specific and insightful.
- Never say "I don't understand" — always find a way to be helpful.
- Make every interaction feel like talking to a real cinema expert who genuinely cares.
- Keep a conversational flow — reference previous messages when relevant.`;

        const aiResponse = await getGroqResponse([
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ], process.env.GROQ_API_KEY as string);
        
        replyText = aiResponse.choices[0].message.content;
      } catch (err) {
        console.error("Groq error, falling back to deterministic:", err);
      }
    }

    // Deterministic fallback if Groq failed or is not configured
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
      // If we used Groq, extract which movies and combos it mentioned to show the rich cards
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

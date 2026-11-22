import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const requestSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  niche: z.string().default("Minecraft & Gaming"),
  contentType: z.enum(["video", "shorts", "post"]).default("video"),
  styleAngle: z
    .enum(["viral_shorts", "curiosity_gap", "seo_search", "contrarian_shock", "story_challenge"])
    .default("curiosity_gap"),
  primaryKeyword: z.string().optional(),
  channelName: z.string().optional(),
});

export interface RankedTitleSuggestion {
  title: string;
  score: number; // e.g. 9.8 out of 10
  category: string;
  charCount: number;
  reasoning: string;
}

export interface RankedTagSuggestion {
  tag: string;
  score: number; // e.g. 9.7 out of 10
  searchVolume: "Very High" | "High" | "Medium";
}

export interface RankedHashtagSuggestion {
  tag: string;
  score: number; // e.g. 9.9 out of 10
  trendStatus: "Viral" | "Trending" | "High Ranking";
}

export interface PublishOptimizerResponse {
  titles: RankedTitleSuggestion[];
  description: {
    text: string;
    score: number;
    hook: string;
    hasChapters: boolean;
    seoFocus: string;
  };
  tags: RankedTagSuggestion[];
  hashtags: RankedHashtagSuggestion[];
  pinnedComment: string;
  thumbnailHooks: string[];
  styleAngle: string;
  contentType: string;
  isAiGenerated: boolean;
}

function cleanKeyword(raw: string): string {
  return raw.replace(/[^\w\s-]/gi, "").trim();
}

function buildHeuristicSuggestions(
  topic: string,
  niche: string,
  contentType: "video" | "shorts" | "post",
  styleAngle: string,
  primaryKeyword?: string,
  channelName?: string
): PublishOptimizerResponse {
  const kw = cleanKeyword(primaryKeyword || topic.split(" ").slice(0, 4).join(" "));
  const isShorts = contentType === "shorts";
  const isPost = contentType === "post";

  let titles: RankedTitleSuggestion[] = [];

  if (isShorts) {
    if (styleAngle === "viral_shorts" || styleAngle === "curiosity_gap") {
      titles = [
        {
          title: `WAIT FOR IT... 💀 What Happens Next?! #shorts`,
          score: 9.8,
          category: "Viral Shorts Hook",
          charCount: 44,
          reasoning: "High pattern interrupt under 45 chars creates immediate curiosity loop.",
        },
        {
          title: `Only 1% of Players Know This Secret 🤯`,
          score: 9.6,
          category: "Exclusivity & Mystery",
          charCount: 39,
          reasoning: "Elite scarcity trigger maximizes viewer completion rate.",
        },
        {
          title: `I Tested ${kw} so you don't have to!`,
          score: 9.4,
          category: "Relatable Value",
          charCount: 42,
          reasoning: "Direct second-person benefit format drives instant watch-time.",
        },
        {
          title: `The Most ILLEGAL Trick in 2026 ⚡`,
          score: 9.2,
          category: "Contrarian Shock",
          charCount: 35,
          reasoning: "Forbidden knowledge angle triggers rapid comment debate.",
        },
      ];
    } else if (styleAngle === "contrarian_shock") {
      titles = [
        {
          title: `STOP Doing This In ${kw}! 🚫`,
          score: 9.7,
          category: "Negative Urgency",
          charCount: 32,
          reasoning: "Loss-aversion warning drives significantly higher mobile CTR.",
        },
        {
          title: `You've Been Playing ${kw} WRONG This Whole Time`,
          score: 9.5,
          category: "Belief Disruption",
          charCount: 49,
          reasoning: "Challenges common practice to trigger cognitive dissonance.",
        },
        {
          title: `Why EVERYONE Is Wrong About ${kw} 💀`,
          score: 9.3,
          category: "Contrarian Debate",
          charCount: 39,
          reasoning: "Polarizing statement drives high comments and re-watches.",
        },
        {
          title: `Delete Your Old Setup. Do This Instead.`,
          score: 9.1,
          category: "Actionable Directive",
          charCount: 40,
          reasoning: "Clear command with immediate curiosity for the solution.",
        },
      ];
    } else {
      titles = [
        {
          title: `The 30-Second ${kw} Guide ⚡`,
          score: 9.6,
          category: "High Intent Speed",
          charCount: 31,
          reasoning: "Promise of rapid value delivery tailored to fast-scroll feeds.",
        },
        {
          title: `How to MASTER ${kw} FAST (Tutorial)`,
          score: 9.4,
          category: "Actionable How-To",
          charCount: 38,
          reasoning: "High search ranking query for mobile discoverability.",
        },
        {
          title: `Best ${kw} Strategy For 2026?`,
          score: 9.2,
          category: "Search Discovery",
          charCount: 33,
          reasoning: "Fresh-year relevance booster for algorithm recommendation.",
        },
        {
          title: `Secret ${kw} Hack Nobody Talks About!`,
          score: 9.0,
          category: "Curiosity Search",
          charCount: 41,
          reasoning: "Combines SEO keyword anchor with curiosity gap modifier.",
        },
      ];
    }
  } else if (isPost) {
    titles = [
      {
        title: `Community Poll: What's your biggest struggle with ${kw}?`,
        score: 9.7,
        category: "Audience Poll",
        charCount: 56,
        reasoning: "High engagement question designed for the Community Feed algorithm.",
      },
      {
        title: `Next Video Sneak Peek: ${topic}! Drop your questions below 👇`,
        score: 9.5,
        category: "Hype Builder",
        charCount: 62,
        reasoning: "Builds anticipation and primes subscriber notification CTR.",
      },
      {
        title: `Which format do you want to see next on the channel?`,
        score: 9.3,
        category: "Crowdsourcing",
        charCount: 54,
        reasoning: "Direct viewer empowerment increases long-term loyalty.",
      },
      {
        title: `Unpopular Opinion on ${kw}... Agree or Disagree? 🤔`,
        score: 9.1,
        category: "Discussion Starter",
        charCount: 52,
        reasoning: "Sparks lively comment threads that boost community tab reach.",
      },
    ];
  } else {
    // Long-form Video Titles
    if (styleAngle === "curiosity_gap") {
      titles = [
        {
          title: `I Tested ${kw} For 100 Hours (It Broke Everything)`,
          score: 9.8,
          category: "Curiosity Gap & Stakes",
          charCount: 52,
          reasoning: "Combines quantified effort with catastrophic outcome curiosity.",
        },
        {
          title: `The Mystery of ${kw} That Nobody Can Explain`,
          score: 9.6,
          category: "Unsolved Mystery",
          charCount: 46,
          reasoning: "Open loop compels viewers to watch until the revelation.",
        },
        {
          title: `What Happens When You Push ${kw} To Its Absolute Limit?`,
          score: 9.4,
          category: "Extreme Boundary Test",
          charCount: 59,
          reasoning: "High emotional curiosity for benchmark extremes.",
        },
        {
          title: `The Secret ${kw} Technique YouTube Keeps Hiding`,
          score: 9.2,
          category: "Insider Knowledge",
          charCount: 50,
          reasoning: "Conspiracy/insider framing drives high initial CTR.",
        },
      ];
    } else if (styleAngle === "contrarian_shock") {
      titles = [
        {
          title: `Why 99% Of People Fail At ${kw} (And How To Win)`,
          score: 9.7,
          category: "Contrarian Truth",
          charCount: 50,
          reasoning: "Fear of failure hook combined with clear promised remedy.",
        },
        {
          title: `Everything You Thought You Knew About ${kw} Is WRONG`,
          score: 9.5,
          category: "Belief Inversion",
          charCount: 54,
          reasoning: "Directly reframes baseline knowledge for high click intent.",
        },
        {
          title: `STOP Doing This In ${kw} (You Are Wasting Time)`,
          score: 9.3,
          category: "Urgent Warning",
          charCount: 48,
          reasoning: "Actionable warning that triggers immediate self-evaluation.",
        },
        {
          title: `I Regret Trying ${kw}... Here's The Truth`,
          score: 9.1,
          category: "Vulnerable Confession",
          charCount: 44,
          reasoning: "Personal emotional vulnerability drives deep audience curiosity.",
        },
      ];
    } else if (styleAngle === "seo_search") {
      titles = [
        {
          title: `How to Master ${kw} in 2026: Complete Step-by-Step Guide`,
          score: 9.6,
          category: "Search Intent Leader",
          charCount: 58,
          reasoning: "Front-loads the exact high-volume search term with fresh-year relevance.",
        },
        {
          title: `${kw} Tutorial for Beginners: Everything You Need to Know`,
          score: 9.4,
          category: "Evergreen Search",
          charCount: 59,
          reasoning: "Targets broad search discovery with proven beginner keyword intent.",
        },
        {
          title: `The Ultimate ${kw} Guide (Tips, Strategies & Walkthrough)`,
          score: 9.2,
          category: "Comprehensive Guide",
          charCount: 58,
          reasoning: "Matches multiple high-value search queries in a single title.",
        },
        {
          title: `Top 5 ${kw} Strategies Ranked From Worst to Best`,
          score: 9.0,
          category: "Curated Comparison",
          charCount: 50,
          reasoning: "Comparative hierarchy titles achieve strong retention and click intent.",
        },
      ];
    } else {
      // story_challenge or viral_shorts default
      titles = [
        {
          title: `I Survived 100 Days With Only ${kw} in Hardcore`,
          score: 9.8,
          category: "Epic Challenge & Stakes",
          charCount: 49,
          reasoning: "Proven viral storytelling format with quantified milestone.",
        },
        {
          title: `Can You Actually Beat ${kw} With ZERO Equipment?`,
          score: 9.5,
          category: "Impossible Hypothesis",
          charCount: 51,
          reasoning: "Interactive question framing challenges audience intuition.",
        },
        {
          title: `From Complete Noob to Pro in ${kw} (Full Journey)`,
          score: 9.3,
          category: "Transformation Arc",
          charCount: 52,
          reasoning: "Transformation narratives generate high Average Percentage Viewed (APV).",
        },
        {
          title: `I Built the World's Most Insane ${kw} Structure`,
          score: 9.1,
          category: "Superlative Showcase",
          charCount: 49,
          reasoning: "Superlative world-first hook drives viral browse impressions.",
        },
      ];
    }
  }

  // High Level SEO Description
  const descriptionText = isShorts
    ? `Can this actually work?! Testing ${topic} to see if it's possible in 2026! 🔥

Drop your thoughts in the comments! Are you using this technique or do you have a better strategy?

⚡ SUBSCRIBE for more daily ${niche} Shorts and quick tutorials!
🔔 Turn on notifications to never miss a secret tip!

#shorts #${cleanKeyword(niche).toLowerCase().replace(/\s+/g, "")} #${kw.toLowerCase().replace(/\s+/g, "")}`
    : `In this deep-dive, we explore ${topic} and test whether it actually works under real conditions! 

Whether you're an experienced creator or just getting started with ${niche}, this video breaks down everything you need to know with zero fluff.

⏱️ CHAPTERS & TIMESTAMPS:
00:00 - The Mystery of ${kw}
01:45 - Key Setup & Initial Test
04:20 - Where Most People Fail
07:15 - The Breakthrough Strategy
10:30 - Final Verdict & Pro Tips

💬 QUESTION OF THE DAY:
What is your go-to strategy for ${kw}? Let me know in the comments below!

🔔 SUBSCRIBE to ${channelName || "the channel"} for weekly in-depth tutorials and breakdowns!

#${cleanKeyword(niche).toLowerCase().replace(/\s+/g, "")} #${kw.toLowerCase().replace(/\s+/g, "")} #gaming #creatorflow`;

  // Ranked Tags with scores out of 10
  const tags: RankedTagSuggestion[] = [
    { tag: kw.toLowerCase(), score: 9.9, searchVolume: "Very High" },
    { tag: `${kw.toLowerCase()} tutorial`, score: 9.7, searchVolume: "Very High" },
    { tag: `${kw.toLowerCase()} guide 2026`, score: 9.6, searchVolume: "High" },
    { tag: `${cleanKeyword(niche).toLowerCase()}`, score: 9.5, searchVolume: "Very High" },
    { tag: `how to ${kw.toLowerCase()}`, score: 9.4, searchVolume: "High" },
    { tag: `best ${kw.toLowerCase()} tips`, score: 9.3, searchVolume: "High" },
    { tag: `${kw.toLowerCase()} secrets`, score: 9.2, searchVolume: "High" },
    { tag: `${cleanKeyword(niche).toLowerCase()} tips`, score: 9.1, searchVolume: "Medium" },
    { tag: `${kw.toLowerCase()} walkthrough`, score: 9.0, searchVolume: "Medium" },
    { tag: `${kw.toLowerCase()} gameplay`, score: 8.9, searchVolume: "High" },
    { tag: `${kw.toLowerCase()} survival`, score: 8.8, searchVolume: "Medium" },
    { tag: `top ${kw.toLowerCase()} tricks`, score: 8.7, searchVolume: "Medium" },
    { tag: `${kw.toLowerCase()} explained`, score: 8.6, searchVolume: "Medium" },
    { tag: `new ${kw.toLowerCase()} update`, score: 8.5, searchVolume: "Medium" },
  ];

  // Ranked Hashtags with scores out of 10
  const hashtags: RankedHashtagSuggestion[] = isShorts
    ? [
        { tag: "#shorts", score: 9.9, trendStatus: "Viral" },
        { tag: `#${cleanKeyword(niche).toLowerCase().replace(/\s+/g, "")}`, score: 9.8, trendStatus: "Viral" },
        { tag: `#${kw.toLowerCase().replace(/\s+/g, "")}`, score: 9.6, trendStatus: "High Ranking" },
        { tag: "#gaming", score: 9.5, trendStatus: "Trending" },
        { tag: "#viral", score: 9.3, trendStatus: "Viral" },
        { tag: `#${kw.toLowerCase().replace(/\s+/g, "")}tips`, score: 9.1, trendStatus: "High Ranking" },
      ]
    : [
        { tag: `#${cleanKeyword(niche).toLowerCase().replace(/\s+/g, "")}`, score: 9.9, trendStatus: "Viral" },
        { tag: `#${kw.toLowerCase().replace(/\s+/g, "")}`, score: 9.7, trendStatus: "High Ranking" },
        { tag: "#gaming", score: 9.6, trendStatus: "Trending" },
        { tag: `#${kw.toLowerCase().replace(/\s+/g, "")}tutorial`, score: 9.4, trendStatus: "High Ranking" },
        { tag: "#creatorflow", score: 9.2, trendStatus: "Trending" },
        { tag: "#youtube2026", score: 9.0, trendStatus: "High Ranking" },
      ];

  const pinnedComment = `💬 Welcome! What did you think of the ${kw} test? Drop your score (1-10) below and let me know which challenge I should tackle next! 👇`;

  const thumbnailHooks = [
    `I TESTED THIS!`,
    `IT BROKE?!`,
    `99% FAIL THIS`,
    `DO NOT DO THIS`,
  ];

  return {
    titles,
    description: {
      text: descriptionText,
      score: 9.7,
      hook: descriptionText.split("\n\n")[0],
      hasChapters: !isShorts,
      seoFocus: `Optimized for '${kw}' and related high-volume ${niche} queries.`,
    },
    tags,
    hashtags,
    pinnedComment,
    thumbnailHooks,
    styleAngle,
    contentType,
    isAiGenerated: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const isShorts = validated.contentType === "shorts";
        const prompt = `You are YouTube's top viral growth strategist and SEO engineer.
Target Content Format: ${validated.contentType.toUpperCase()} (${isShorts ? "YouTube Short under 60 seconds, vertical" : "Long-form YouTube video"}).
Channel Niche: ${validated.niche}
Video Premise: "${validated.topic}"
Creative Angle: ${validated.styleAngle}

Requirements:
1. Generate 4 ultra-engaging, short, curious YouTube titles tailored to this creative angle.
   - For Shorts: maximum 45 characters, punchy open loops, emojis, high pattern interrupt.
   - For Video: under 60 characters for mobile feed readability, high curiosity gap.
   - Give EVERY title an exact numerical CTR score out of 10 (e.g. 9.8, 9.6).
   - Provide a 1-sentence reasoning why this title hooks human psychology.
2. High-level SEO description:
   - Compelling 2-sentence hook above the fold.
   ${!isShorts ? "- Timestamped chapter markers (00:00, etc.)." : ""}
   - Give an SEO score out of 10.
3. 14 High-ranking YouTube video tags relevant to the topic, each with a ranking score out of 10 and search volume ("Very High"|"High"|"Medium").
4. 6 High-ranking hashtags, each with a score out of 10 and trend status ("Viral"|"Trending"|"High Ranking").
5. High-engagement pinned comment prompt.
6. 4 Short punchy thumbnail text hooks (2-4 words max).

Return ONLY valid JSON matching this schema:
{
  "titles": [
    { "title": "...", "score": 9.8, "category": "...", "charCount": 42, "reasoning": "..." }
  ],
  "description": {
    "text": "...",
    "score": 9.7,
    "hook": "...",
    "hasChapters": ${!isShorts},
    "seoFocus": "..."
  },
  "tags": [
    { "tag": "...", "score": 9.7, "searchVolume": "Very High" }
  ],
  "hashtags": [
    { "tag": "#...", "score": 9.9, "trendStatus": "Viral" }
  ],
  "pinnedComment": "...",
  "thumbnailHooks": ["...", "..."]
}`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
          },
        });

        const rawText = result.response.text();
        const parsed = JSON.parse(rawText);

        return NextResponse.json({
          success: true,
          data: {
            ...parsed,
            styleAngle: validated.styleAngle,
            contentType: validated.contentType,
            isAiGenerated: true,
          },
        });
      } catch (geminiError: any) {
        console.warn("[PublishOptimizer] Gemini API call failed, falling back to heuristics:", geminiError?.message);
        // Fall back to intelligent heuristics
      }
    }

    // Heuristic fallback
    const suggestions = buildHeuristicSuggestions(
      validated.topic,
      validated.niche,
      validated.contentType,
      validated.styleAngle,
      validated.primaryKeyword,
      validated.channelName
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate publish optimization package" },
      { status: 500 }
    );
  }
}

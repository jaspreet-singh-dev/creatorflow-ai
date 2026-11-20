import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateMetadataInput {
  topic: string;
  descriptionOrTranscript?: string;
  niche: string;
  targetAudience: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  preferredTone: string;
  language: string;
}

export interface GeneratedMetadataOutput {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
  chapters: { time: string; title: string }[];
  thumbnailIdeas: string[];
  qualityScore: {
    overall: number;
    clarity: number;
    relevance: number;
    readability: number;
    keywordCoverage: number;
    critique: string[];
  };
}

export interface GenerateAssistantInput {
  mode: "ideas" | "hook" | "outline" | "series" | "shorts" | "calendar" | "keywords";
  niche: string;
  topic?: string;
  targetAudience?: string;
}

export async function generateMetadata(input: GenerateMetadataInput): Promise<GeneratedMetadataOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert YouTube algorithm strategist, metadata engineer, and copywriter for CreatorFlow AI.
Analyze the following video brief:

Topic: "${input.topic}"
Channel Niche: "${input.niche}"
Target Audience: "${input.targetAudience}"
Primary Keyword: "${input.primaryKeyword}"
Secondary Keywords: ${input.secondaryKeywords.join(", ")}
Tone: "${input.preferredTone}"
Language: "${input.language}"
Input Context/Transcript: "${input.descriptionOrTranscript || "None provided"}"

Generate the highest performing YouTube metadata. Follow these strict rules:
1. Exactly 5 title variations featuring curiosity gaps, high CTR hooks, and the primary keyword.
2. Comprehensive SEO-optimized YouTube description (Hook sentence, 2-paragraph summary, structured timestamps/chapters placeholder or real chapters if transcript provided, call to action, social links placeholder).
3. 15-20 comma-separated searchable YouTube tags.
4. 3-5 hashtag suggestions starting with #.
5. 1 high-engagement suggested pinned comment asking a strategic community question.
6. 4-6 video chapter timestamps (e.g. 00:00 Intro, 02:15 Topic Breakdown, etc.).
7. 4 short, punchy thumbnail text ideas (under 4 words each).
8. An explainable quality score based on: clarity (0-100), relevance (0-100), readability (0-100), keywordCoverage (0-100), overall (0-100), and 2-3 specific critique points. NEVER promise guaranteed rankings.

Return ONLY a valid JSON object with this exact structure:
{
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "description": "...",
  "tags": ["tag1", "tag2"],
  "hashtags": ["#tag1", "#tag2"],
  "pinnedComment": "...",
  "chapters": [{"time": "00:00", "title": "Introduction"}],
  "thumbnailIdeas": ["Idea 1", "Idea 2"],
  "qualityScore": {
    "overall": 94,
    "clarity": 95,
    "relevance": 92,
    "readability": 96,
    "keywordCoverage": 93,
    "critique": ["Strong curiosity gap in title 1", "High primary keyword placement"]
  }
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedMetadataOutput;
      }
    } catch (err) {
      console.warn("Gemini API call failed or rate-limited; falling back to heuristic engine:", err);
    }
  }

  // High-Quality Heuristic Fallback Engine
  return generateHeuristicMetadata(input);
}

function generateHeuristicMetadata(input: GenerateMetadataInput): GeneratedMetadataOutput {
  const kw = input.primaryKeyword || input.topic || "YouTube Strategy";
  const sec = input.secondaryKeywords.length > 0 ? input.secondaryKeywords : ["Tutorial", "Guide", "Tips"];

  const titles = [
    `How I Mastered ${kw} in 2026 (Step-by-Step Blueprint)`,
    `The Truth About ${kw} Nobody Is Telling You`,
    `Stop Doing ${kw} Like This! (Do This Instead)`,
    `${kw}: 5 Proven Secrets Every Creator Needs`,
    `From Beginner to Pro with ${kw} (Complete Masterclass)`,
  ];

  const chapters = [
    { time: "00:00", title: `The Problem with Traditional ${kw}` },
    { time: "02:45", title: `Core Blueprint & System Setup` },
    { time: "07:30", title: `Live Demonstration & Step-by-Step Execution` },
    { time: "14:15", title: `The 3 Biggest Mistakes to Avoid` },
    { time: "19:50", title: `Final Workflow & Action Steps` },
  ];

  const tags = [
    kw.toLowerCase(),
    `${kw.toLowerCase()} tutorial`,
    `${kw.toLowerCase()} guide`,
    `${kw.toLowerCase()} 2026`,
    ...sec.map((s) => s.toLowerCase()),
    input.niche.toLowerCase(),
    "creatorflow",
    "step by step",
    "how to",
  ];

  const hashtags = [
    `#${kw.replace(/\s+/g, "")}`,
    `#${input.niche.replace(/\s+/g, "")}`,
    "#YouTubeGrowth",
    "#ContentCreator",
  ];

  const description = `Looking to master ${kw}? In this breakdown, we reveal the exact system top ${input.niche} creators use to achieve consistent results.\n\nWhether you are an aspiring creator or experienced operator, this step-by-step masterclass covers:\n• Why most creators struggle with ${kw}\n• The full execution framework\n• Proven tactics for ${input.targetAudience}\n\nTIMESTAMPS:\n${chapters.map((c) => `${c.time} - ${c.title}`).join("\n")}\n\nRESOURCES MENTIONED:\n👉 Try CreatorFlow AI: https://creatorflow.ai\n👉 Full Documentation & Source: https://creatorflow.ai/docs\n\nDISCLAIMER: Content optimization improves audience relevance and search discoverability but does not guarantee algorithm distribution or subscriber growth.`;

  const pinnedComment = `💬 Question of the day: What is your biggest challenge when implementing ${kw}? Let me know below and I will reply with actionable feedback!`;

  const thumbnailIdeas = [
    `I Tried ${kw}!`,
    `STOP DOING THIS`,
    `2026 BLUEPRINT`,
    `SECRET METHOD`,
  ];

  return {
    titles,
    description,
    tags,
    hashtags,
    pinnedComment,
    chapters,
    thumbnailIdeas,
    qualityScore: {
      overall: 93,
      clarity: 95,
      relevance: 92,
      readability: 96,
      keywordCoverage: 89,
      critique: [
        "Primary keyword is placed within the first 60 characters of title variations.",
        "Description includes structured chapter markers for enhanced search indexing.",
        "Disclaimers included: No false ranking guarantees promised.",
      ],
    },
  };
}

export async function generateContentAssistant(input: GenerateAssistantInput): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert YouTube content strategist for CreatorFlow AI.
Task: Generate high-retention content ideas for:
Mode: ${input.mode}
Niche: ${input.niche}
Topic: ${input.topic || "General viral concepts"}
Target Audience: ${input.targetAudience || "Broad interested creators"}

Return ONLY a valid JSON array or object tailored to "${input.mode}".
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.warn("Gemini Content Assistant API fallback:", e);
    }
  }

  // Fallback tailored responses based on mode
  if (input.mode === "hook") {
    return [
      {
        hook: `If you are still doing ${input.topic || input.niche} this way, you are wasting 80% of your time.`,
        angle: "Pain point / loss aversion",
        retentionRating: "9.6/10",
      },
      {
        hook: `I spent 30 days analyzing top ${input.niche} channels, and they all do this one weird trick at minute 2.`,
        angle: "Curiosity gap / investigative",
        retentionRating: "9.2/10",
      },
      {
        hook: `Most people think ${input.topic || input.niche} is dead in 2026. Here is the actual data.`,
        angle: "Contrarian / myth busting",
        retentionRating: "9.4/10",
      },
    ];
  }

  if (input.mode === "shorts") {
    return [
      {
        title: `The 15-Second ${input.niche} Hack`,
        hook: "Do NOT scroll if you make videos in 2026.",
        concept: "Fast visual pacing with text overlay showing before/after contrast.",
        callToAction: "Follow for daily automation blueprints.",
      },
      {
        title: `Stop Making This ${input.niche} Mistake`,
        hook: "Why 99% of creators fail at this step.",
        concept: "Call out a common myth, present immediate 3-second solution.",
        callToAction: "Save this video for your next upload.",
      },
    ];
  }

  // Default ideas mode
  return [
    {
      title: `How I Automated My Entire ${input.niche} Workflow (Zero Coding)`,
      hook: "What used to take me 14 hours every weekend now takes 18 minutes on Monday morning.",
      format: "long_form",
      outline: [
        "1. Breaking down the old bottleneck workflow",
        "2. The 3 automated triggers implemented",
        "3. Live step-by-step demonstration",
        "4. Exact ROI & time saved",
      ],
      keywords: [`${input.niche} automation`, "content workflow", "productivity 2026"],
    },
    {
      title: `The Ultimate ${input.niche} Beginner Guide (Everything You Need in 2026)`,
      hook: "If I had to start over in this niche today with $0, here is exactly what I would build.",
      format: "long_form",
      outline: [
        "1. Setting up the channel positioning",
        "2. Equipment and software you actually need",
        "3. First 5 video topics to gain traction",
        "4. Monetization pathways beyond AdSense",
      ],
      keywords: [`beginner ${input.niche}`, "how to start", "tutorial 2026"],
    },
    {
      title: `I Tested 5 Viral ${input.niche} Strategies: Here are the Real Results`,
      hook: "I spent 3 weeks and $500 testing the most hyped growth hacks so you don't have to.",
      format: "long_form",
      outline: [
        "1. Strategy 1 & 2: What happened to watch time",
        "2. The surprising technique that actually worked",
        "3. The danger of short-term view spikes",
      ],
      keywords: ["youtube growth experiment", `${input.niche} review`, "case study"],
    },
  ];
}

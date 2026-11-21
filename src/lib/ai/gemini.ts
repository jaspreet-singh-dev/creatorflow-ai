import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IdeaFormat } from "@/types/database.types";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

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
  isHeuristicFallback?: boolean;
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
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

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
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedMetadataOutput;
        parsed.isHeuristicFallback = false;
        return parsed;
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
    isHeuristicFallback: true,
    qualityScore: {
      overall: 88,
      clarity: 92,
      relevance: 90,
      readability: 94,
      keywordCoverage: 86,
      critique: [
        "[Demo Sandbox Mode] Generated via heuristic template engine. Set your GEMINI_API_KEY in Settings for live Gemini 1.5 Flash AI generation.",
        "Primary keyword is placed within the first 60 characters of title variations.",
        "Description includes structured chapter markers for enhanced search indexing.",
        "Transparent SEO Disclaimer: Metadata optimizes discoverability but does not guarantee algorithm distribution.",
      ],
    },
  };
}

export async function generateContentAssistant(input: GenerateAssistantInput): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      let formatSpec = "";
      if (input.mode === "hook") {
        formatSpec = `Return ONLY a valid JSON array of 3 objects:
[
  { "hook": "...", "angle": "...", "retentionScore": "9.5 / 10" }
]`;
      } else if (input.mode === "shorts") {
        formatSpec = `Return ONLY a valid JSON array of 2-3 objects:
[
  { "title": "...", "hook": "...", "concept": "...", "action": "..." }
]`;
      } else if (input.mode === "series") {
        formatSpec = `Return ONLY a valid JSON array of 1-2 objects:
[
  {
    "seriesTitle": "...",
    "targetViews": "100k+ Target Views",
    "episodes": [
      { "ep": "Part 1", "title": "...", "focus": "..." },
      { "ep": "Part 2", "title": "...", "focus": "..." },
      { "ep": "Part 3", "title": "...", "focus": "..." },
      { "ep": "Part 4", "title": "...", "focus": "..." }
    ]
  }
]`;
      } else {
        formatSpec = `Return ONLY a valid JSON array of 3 objects:
[
  {
    "title": "...",
    "hook": "...",
    "format": "long_form",
    "outline": ["1. Introduction", "2. Core Framework", "3. Implementation", "4. Summary"],
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]`;
      }

      const prompt = `
You are an expert YouTube content strategist for CreatorFlow AI.
Task: Generate high-retention content ideas for:
Mode: ${input.mode}
Niche: ${input.niche}
Topic: ${input.topic || "General viral concepts"}
Target Audience: ${input.targetAudience || "Broad interested creators"}

${formatSpec}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        let items: any[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (typeof parsed === "object" && parsed !== null) {
          const arr =
            parsed.ideas ||
            parsed.content_ideas ||
            parsed.hooks ||
            parsed.shorts ||
            parsed.series ||
            parsed.episodes ||
            parsed.data ||
            parsed.results ||
            Object.values(parsed).find((v) => Array.isArray(v));
          if (Array.isArray(arr)) {
            items = arr;
          } else {
            items = [parsed];
          }
        }

        if (items.length > 0) {
          if (input.mode === "hook") {
            return items.map((h: any) => ({
              hook: h.hook || h.title || `High retention hook for ${input.topic || input.niche}`,
              angle: h.angle || "Curiosity Gap",
              retentionScore: h.retentionScore || h.retentionRating || "9.5 / 10",
            }));
          } else if (input.mode === "shorts") {
            return items.map((s: any) => ({
              title: s.title || `Viral Short: ${input.topic || input.niche}`,
              hook: s.hook || "Wait until you see this...",
              concept: s.concept || s.description || "Fast visual pacing with high engagement hook",
              action: s.action || s.callToAction || "Subscribe for daily blueprints",
            }));
          } else if (input.mode === "series") {
            return items.map((ser: any, idx: number) => ({
              seriesTitle: ser.seriesTitle || ser.title || `The ${input.niche} Blueprint Series`,
              targetViews: ser.targetViews || "100k+ Views",
              episodes: Array.isArray(ser.episodes)
                ? ser.episodes.map((ep: any, eIdx: number) => ({
                    ep: ep.ep || `Part ${eIdx + 1}`,
                    title: ep.title || `Episode ${eIdx + 1}`,
                    focus: ep.focus || "Core Workflow",
                  }))
                : [
                    { ep: "Part 1", title: "Foundation & Architecture", focus: "Core Setup" },
                    { ep: "Part 2", title: "Deep Dive & Execution", focus: "Workflow" },
                  ],
            }));
          } else {
            return items.map((item: any) => ({
              title: item.title || `How to Master ${input.topic || input.niche}`,
              hook: item.hook || item.description || "The exact blueprint top creators use.",
              format: (item.format || "long_form") as IdeaFormat,
              outline: Array.isArray(item.outline)
                ? item.outline
                : typeof item.outline === "string"
                ? [item.outline]
                : ["1. The Problem", "2. The Framework", "3. Step-by-Step Execution", "4. Action Plan"],
              keywords: Array.isArray(item.keywords)
                ? item.keywords
                : Array.isArray(item.suggested_keywords)
                ? item.suggested_keywords
                : [input.niche.toLowerCase(), "tutorial", "guide"],
            }));
          }
        }
      }
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

// ---------------------------------------------------------------------------
// Section-Level AI Regeneration & Channel-Contextual AI Engine
// ---------------------------------------------------------------------------
export type SectionType =
  | "titles"
  | "hooks"
  | "script"
  | "outline"
  | "description"
  | "tags"
  | "hashtags"
  | "thumbnailText"
  | "pinnedComment";

export interface ChannelContextInput {
  channelTitle?: string;
  niche?: string;
  subscriberCount?: number;
  recentVideoTopics?: string[];
  isDemo?: boolean;
}

export interface GenerateSectionInput {
  section: SectionType;
  topic: string;
  niche?: string;
  contentType?: string;
  targetAudience?: string;
  selectedTitle?: string;
  currentScript?: string;
  language?: string;
  channelContext?: ChannelContextInput;
}

export interface GeneratedSectionOutput {
  section: SectionType;
  data: any;
  isHeuristicFallback: boolean;
  attributionNotice: string;
}

export async function generateSectionAI(input: GenerateSectionInput): Promise<GeneratedSectionOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  const niche = input.niche || "Content Creation";
  const contentType = input.contentType || "tutorial";
  const audience = input.targetAudience || "YouTube viewers";
  const language = input.language || "English";
  const topic = input.topic || "YouTube Strategy";
  const title = input.selectedTitle || topic;

  // Build channel context prompt if provided
  let channelPrompt = "";
  if (input.channelContext) {
    const ctx = input.channelContext;
    channelPrompt = `\nActive Channel Context:
- Channel Name: "${ctx.channelTitle || "Creator Channel"}"
- Known Subscribers: ${ctx.subscriberCount ? ctx.subscriberCount.toLocaleString() : "Unknown"}
- Recent Video Themes: ${ctx.recentVideoTopics && ctx.recentVideoTopics.length > 0 ? ctx.recentVideoTopics.slice(0, 4).join(" | ") : "Not provided"}
- Context Mode: ${ctx.isDemo ? "Demo Sandbox" : "Authorized Live Channel"}`;
  }

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      let prompt = `You are an expert YouTube algorithm strategist, metadata engineer, and script doctor for CreatorFlow AI.
Topic: "${topic}"
Selected Title: "${title}"
Niche: "${niche}"
Content Format: "${contentType}"
Target Audience: "${audience}"
Language: "${language}"${channelPrompt}

TASK: Generate ONLY the requested section: "${input.section}".`;

      if (input.section === "titles") {
        prompt += `\nGenerate exactly 5 distinct, high-CTR YouTube titles for this video. Use curiosity gaps, clear value delivery, and natural phrasing. Return JSON array of 5 strings: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"].`;
      } else if (input.section === "hooks") {
        prompt += `\nGenerate exactly 3 high-retention opening hooks (0-3 seconds). Hook 1: Problem-first / pain point. Hook 2: Curiosity gap / mystery. Hook 3: Contrarian / myth-busting. Return JSON array of objects: [{"hook": "...", "angle": "...", "retentionRating": "9.5/10"}].`;
      } else if (input.section === "script") {
        prompt += `\nGenerate a complete, engaging YouTube script draft for a ${contentType} video in ${language}. Include clear sections: [00:00 - HOOK], [00:45 - PREMISE], [02:30 - MAIN TEACHING / CORE VALUE], [06:00 - PATTERN INTERRUPT], [08:30 - ACTIONABLE DEMO], [12:00 - VALUE CLIMAX], and [14:00 - OUTRO & CTA]. Include visual cues like [VISUAL: ...] for b-roll or screen recording. Return JSON object: {"script": "..."}.`;
      } else if (input.section === "outline") {
        prompt += `\nGenerate 5 to 7 structured YouTube video chapters with realistic timestamps. Return JSON array of objects: [{"time": "00:00", "title": "Introduction & Hook"}, {"time": "02:15", "title": "..."}].`;
      } else if (input.section === "description") {
        prompt += `\nGenerate a comprehensive, SEO-optimized YouTube description. Include a 2-sentence hook summary, chapter timestamps placeholders, key takeaways, resources/links section, and a natural disclaimer. Return JSON object: {"description": "..."}.`;
      } else if (input.section === "tags") {
        prompt += `\nGenerate 15 to 20 comma-separated searchable YouTube tags mixing broad, specific, and long-tail phrases. Return JSON array of strings: ["tag1", "tag2", ...].`;
      } else if (input.section === "hashtags") {
        prompt += `\nGenerate 3 to 5 hashtag suggestions starting with #. Return JSON array of strings: ["#Tag1", "#Tag2", ...].`;
      } else if (input.section === "thumbnailText") {
        prompt += `\nGenerate 4 short, punchy 2-to-4 word thumbnail text concepts designed for high visual contrast on a 16:9 canvas. Return JSON array of strings: ["TEXT 1", "TEXT 2", "TEXT 3", "TEXT 4"].`;
      } else if (input.section === "pinnedComment") {
        prompt += `\nGenerate 1 strategic pinned comment question to trigger high viewer discussion in the comments. Return JSON object: {"pinnedComment": "..."}.`;
      }

      prompt += `\nReturn ONLY valid JSON with no markdown wrapping or preamble.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        let data = parsed;
        if (input.section === "script" && parsed.script) data = parsed.script;
        if (input.section === "description" && parsed.description) data = parsed.description;
        if (input.section === "pinnedComment" && parsed.pinnedComment) data = parsed.pinnedComment;

        return {
          section: input.section,
          data,
          isHeuristicFallback: false,
          attributionNotice: `Generated via live Gemini (${GEMINI_MODEL})${input.channelContext?.channelTitle ? ` • Context: ${input.channelContext.channelTitle}` : ""}.`,
        };
      }
    } catch (err) {
      console.warn(`Gemini section generation failed for ${input.section}; falling back to heuristic engine:`, err);
    }
  }

  // Heuristic Fallback per Section
  return generateHeuristicSection(input);
}

function generateHeuristicSection(input: GenerateSectionInput): GeneratedSectionOutput {
  const topic = input.topic || "YouTube Creation";
  const title = input.selectedTitle || topic;
  const niche = input.niche || "Content Creation";
  const channelName = input.channelContext?.channelTitle;

  let data: any = null;

  switch (input.section) {
    case "titles": {
      data = [
        `How I Mastered ${topic} in 2026 (The Step-by-Step Blueprint)`,
        `The Brutal Truth About ${topic} Nobody Is Telling You`,
        `Stop Doing ${topic} Like This! (Do This Instead)`,
        `From Zero to Pro: The Complete ${topic} Masterclass`,
        `5 Simple Secrets to 10x Your Results with ${topic}`,
      ];
      break;
    }
    case "hooks": {
      data = [
        {
          hook: `If you are still approaching ${topic} the traditional way, you are wasting 80% of your effort in 2026.`,
          angle: "Pain point / loss aversion",
          retentionRating: "9.6/10",
        },
        {
          hook: `I spent 30 days testing ${topic} so you don't make the costly mistakes I did.`,
          angle: "Curiosity gap / investigation",
          retentionRating: "9.3/10",
        },
        {
          hook: `Most creators believe ${topic} is overcrowded. Here is why they are completely wrong.`,
          angle: "Contrarian / myth-busting",
          retentionRating: "9.5/10",
        },
      ];
      break;
    }
    case "script": {
      data = `[00:00 - HOOK]
If you are still approaching ${topic} the traditional way, you are wasting 80% of your effort. In this breakdown, we reveal the production-tested system that transforms your results.

[00:45 - PREMISE & WHY TRADITIONAL METHODS FAIL]
[VISUAL: Side-by-side comparison of old vs new workflow]
Here is why most creators struggle with ${topic}: they focus on vanity metrics rather than retention architecture. Today we break down the 3 core pillars.

[02:30 - PILLAR 1: FOUNDATION SETUP]
[VISUAL: Step-by-step screen demonstration]
First, let's establish the baseline. You need to configure your environment so that every action feeds directly into your publishing pipeline.

[06:00 - RETENTION PATTERN INTERRUPT]
[VISUAL: Graphic callout with key mistake highlight]
Notice what happens here: 90% of beginners skip this exact step and wonder why audience retention drops at minute 4. Don't make this mistake.

[08:15 - PILLAR 2: LIVE EXECUTION & WORKFLOW]
[VISUAL: Live screen capture demonstrating implementation]
Now watch how this works in real time. We take the initial concept and run it through our automated workflow.

[12:30 - VALUE CLIMAX & PRO TIPS]
The secret differentiator isn't working more hours—it's building repeatable systems that compound over time.

[14:15 - OUTRO & ACTION STEP]
Drop a comment below with your biggest takeaway, and make sure to subscribe for our next deep-dive masterclass!`;
      break;
    }
    case "outline": {
      data = [
        { time: "00:00", title: `The Problem with Traditional ${topic}` },
        { time: "01:30", title: `System Setup & Architecture` },
        { time: "05:15", title: `Live Step-by-Step Execution` },
        { time: "09:45", title: `The 3 Biggest Mistakes to Avoid` },
        { time: "13:20", title: `Pro Workflow Optimization` },
        { time: "16:00", title: `Final Blueprint & Action Checklist` },
      ];
      break;
    }
    case "description": {
      data = `Looking to master ${topic}? In this comprehensive breakdown, we walk through the exact system top ${niche} creators use to achieve consistent, compounding results in 2026.

Whether you are just getting started or scaling an established channel, this step-by-step masterclass covers everything you need to execute with confidence.

TIMESTAMPS:
00:00 - The Problem with Traditional ${topic}
01:30 - System Setup & Architecture
05:15 - Live Step-by-Step Execution
09:45 - The 3 Biggest Mistakes to Avoid
13:20 - Pro Workflow Optimization
16:00 - Final Blueprint & Action Checklist

RESOURCES MENTIONED:
👉 CreatorFlow AI Workspace: https://creatorflow.ai
👉 Step-by-Step Workflow Guides: https://creatorflow.ai/guides

DISCLAIMER: Content optimization and metadata improve organic search discoverability and viewer relevance. Algorithmic distribution depends on real audience engagement and watch time.`;
      break;
    }
    case "tags": {
      data = [
        topic.toLowerCase(),
        `${topic.toLowerCase()} tutorial`,
        `${topic.toLowerCase()} guide`,
        `${topic.toLowerCase()} 2026`,
        niche.toLowerCase(),
        "step by step",
        "how to",
        "creatorflow",
        "youtube tips",
        "workflow automation",
        "best practices",
        "content strategy",
      ];
      break;
    }
    case "hashtags": {
      data = [
        `#${topic.replace(/[^a-zA-Z0-9]/g, "")}`,
        `#${niche.replace(/[^a-zA-Z0-9]/g, "")}`,
        "#YouTubeGrowth",
        "#ContentCreation",
      ];
      break;
    }
    case "thumbnailText": {
      data = [
        "STOP DOING THIS",
        "2026 BLUEPRINT",
        "THE REAL TRUTH",
        "10x YOUR RESULTS",
      ];
      break;
    }
    case "pinnedComment": {
      data = `💬 Question of the day: What has been your biggest bottleneck when executing on ${topic}? Share your experience below and let's troubleshoot together!`;
      break;
    }
  }

  return {
    section: input.section,
    data,
    isHeuristicFallback: true,
    attributionNotice: `[Sandbox Engine] Heuristic pattern generation${channelName ? ` • Channel: ${channelName}` : ""}. Connect GEMINI_API_KEY in Settings for custom generative AI.`,
  };
}

// ---------------------------------------------------------------------------
// Phase 2: Complete AI Creator Studio Functions
// ---------------------------------------------------------------------------

export interface CategorizedTitle {
  title: string;
  category: "Search-Oriented" | "Curiosity-Driven" | "Educational" | "Tutorial" | "Comparison" | "Storytelling" | "Short & Direct";
  mainKeyword: string;
  approachExplanation: string;
  readability: string;
  improvementTip: string;
}

export interface ThumbnailConcept {
  id: string;
  mainSubject: string;
  composition: string;
  background: string;
  visualFocus: string;
  textSuggestion: string;
  contrast: string;
  readability: string;
}

export interface CompleteVideoPackage {
  multipleTitles: CategorizedTitle[];
  recommendedTitle: string;
  completeDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  youtubeTags: string[];
  hashtags: string[];
  openingHook: string;
  videoOutline: { time: string; title: string; notes?: string }[];
  thumbnailConcepts: ThumbnailConcept[];
  additionalMetadataRecommendations: string[];
  qualityScore: {
    overall: number;
    clarity: number;
    relevance: number;
    readability: number;
    keywordCoverage: number;
    critique: string[];
  };
  isHeuristicFallback: boolean;
  attributionNotice: string;
}

export interface ChannelIdea {
  id: string;
  concept: string;
  targetAudience: string;
  whyRelevant: string;
  suggestedFormat: string;
  hook: string;
  suggestedTitle: string;
  contentOutline: string[];
  mainKeyword: string;
  secondaryKeywords: string[];
  suggestedTags: string[];
  thumbnailConcept: {
    mainSubject: string;
    composition: string;
    background: string;
    textSuggestion: string;
    contrast: string;
    readability: string;
  };
}

export interface ChannelIdeasInput {
  niche: string;
  channelTitle?: string;
  recentVideoTopics?: string[];
  subscriberCount?: number;
  targetAudience?: string;
  preferredFormat?: string;
}

export async function generateChannelIdeas(input: ChannelIdeasInput): Promise<{ ideas: ChannelIdea[]; isHeuristicFallback: boolean; attributionNotice: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const niche = input.niche || "Tech & Creation";
  const channelName = input.channelTitle || "Creator Channel";

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `You are a YouTube growth strategist for CreatorFlow AI.
Analyze the channel context and generate 4 high-value, audience-aligned YouTube video ideas.
Channel Name: "${channelName}"
Niche: "${niche}"
Recent Topics: ${input.recentVideoTopics?.join(", ") || "General in-depth tutorials and reviews"}
Target Audience: "${input.targetAudience || "Ambitious creators & developers"}"
Preferred Format: "${input.preferredFormat || "Long-form & Tutorials"}"

Return ONLY a valid JSON array of 4 objects matching this exact structure:
[
  {
    "id": "idea-1",
    "concept": "Core concept summary",
    "targetAudience": "Audience description",
    "whyRelevant": "Why viewers will click and watch in 2026",
    "suggestedFormat": "Step-by-Step Tutorial",
    "hook": "Opening 0-3 second pattern interrupt",
    "suggestedTitle": "High CTR Title",
    "contentOutline": ["1. Hook & Problem", "2. Blueprint Setup", "3. Live Demonstration", "4. Actionable Next Steps"],
    "mainKeyword": "keyword phrase",
    "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
    "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "thumbnailConcept": {
      "mainSubject": "Clear physical or digital subject",
      "composition": "Rule of thirds with high contrast",
      "background": "Dark navy or high-contrast background",
      "textSuggestion": "BOLD 3-WORD TEXT",
      "contrast": "High contrast neon/white on dark",
      "readability": "Readable on mobile under 1 second"
    }
  }
]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            ideas: parsed.map((item: any, idx: number) => ({
              id: item.id || `idea-${Date.now()}-${idx}`,
              concept: item.concept || item.title || "Video Concept",
              targetAudience: item.targetAudience || input.targetAudience || "Target Audience",
              whyRelevant: item.whyRelevant || "High audience search relevance and engagement potential.",
              suggestedFormat: item.suggestedFormat || "Step-by-Step Tutorial",
              hook: item.hook || "Compelling opening retention hook",
              suggestedTitle: item.suggestedTitle || item.title || "Untitled Video Concept",
              contentOutline: Array.isArray(item.contentOutline) ? item.contentOutline : ["1. Intro", "2. Execution", "3. Takeaways"],
              mainKeyword: item.mainKeyword || niche.toLowerCase(),
              secondaryKeywords: Array.isArray(item.secondaryKeywords) ? item.secondaryKeywords : [niche.toLowerCase(), "tutorial"],
              suggestedTags: Array.isArray(item.suggestedTags) ? item.suggestedTags : [niche.toLowerCase(), "guide"],
              thumbnailConcept: {
                mainSubject: item.thumbnailConcept?.mainSubject || "Subject focal point",
                composition: item.thumbnailConcept?.composition || "Close-up with high contrast",
                background: item.thumbnailConcept?.background || "Dark studio backdrop",
                textSuggestion: item.thumbnailConcept?.textSuggestion || "MUST WATCH",
                contrast: item.thumbnailConcept?.contrast || "High contrast",
                readability: item.thumbnailConcept?.readability || "High readability",
              },
            })),
            isHeuristicFallback: false,
            attributionNotice: `Generated with live Gemini AI (${GEMINI_MODEL}) tailored for ${channelName}.`,
          };
        }
      }
    } catch (e) {
      console.warn("generateChannelIdeas API fallback:", e);
    }
  }

  // Heuristic Fallback
  return {
    ideas: [
      {
        id: `idea-fallback-1`,
        concept: `How I Automated My Entire ${niche} Pipeline in 2026 (Zero Coding Required)`,
        targetAudience: "Aspiring creators and tech-minded entrepreneurs seeking efficient scaling",
        whyRelevant: "Productivity and automated workflows are among the fastest growing viewer search themes.",
        suggestedFormat: "Step-by-Step Tutorial",
        hook: "What used to take me 14 hours every single weekend now executes automatically in 18 minutes on Monday morning.",
        suggestedTitle: `How I Automated My Entire ${niche} Workflow (Zero Coding)`,
        contentOutline: [
          "1. The 14-Hour Bottleneck: Why manual creation burns creators out",
          "2. The 3-Step Trigger Pipeline: Connecting tools without custom code",
          "3. Live Setup: Creating the automated workspace in real time",
          "4. Production Stress Test: Generating real content from scratch",
          "5. Action Checklist & Resource Template for viewers",
        ],
        mainKeyword: `${niche.toLowerCase()} automation`,
        secondaryKeywords: ["content workflow", "creator productivity", "ai studio 2026", "efficiency blueprint"],
        suggestedTags: [`${niche.toLowerCase()} tutorial`, "workflow automation", "creator guide", "productivity 2026", "how to scale"],
        thumbnailConcept: {
          mainSubject: "Side-by-side timer comparison: 14h (Red) vs 18m (Green)",
          composition: "Split screen with bold arrow pointing to the green efficiency metric",
          background: "Deep navy workspace with subtle code/graph glow",
          textSuggestion: "14h → 18m",
          contrast: "Neon emerald and amber accents over deep AMOLED black",
          readability: "Sub-second visual comprehension on mobile YouTube app feeds",
        },
      },
      {
        id: `idea-fallback-2`,
        concept: `The Brutal Truth About Growing a ${niche} Channel Nobody Is Telling You`,
        targetAudience: "Creators struggling with flatlined view metrics and low initial click-through rates",
        whyRelevant: "Contrarian analysis breaks through standard advice clutter with genuine retention value.",
        suggestedFormat: "Deep Dive & Case Study",
        hook: "Everyone tells you to upload 3 times a week to grow. In 2026, following that advice will actually kill your channel.",
        suggestedTitle: `Why 90% of New ${niche} Channels Fail in 2026 (And What the Top 1% Do)`,
        contentOutline: [
          "1. The Volume Trap: Why publishing mediocre videos penalizes channel authority",
          "2. Watch Time Architecture: The retention pattern top creators protect at minute 2",
          "3. Real Channel Audit: Before and after metric comparison",
          "4. The 3 Dials to Turn: Title curiosity, thumbnail contrast, and intro pacing",
          "5. Strategic Summary & Growth Formula",
        ],
        mainKeyword: `${niche.toLowerCase()} growth truth`,
        secondaryKeywords: ["youtube algorithm 2026", "channel audit", "audience retention", "ctr optimization"],
        suggestedTags: ["channel growth", "retention strategy", "youtube tips 2026", "growth secrets", "channel advice"],
        thumbnailConcept: {
          mainSubject: "Shocked creator expression pointing at a descending vs ascending graph line",
          composition: "Close-up expression on right, bold red warning icon on left",
          background: "Blurred YouTube Studio analytics dashboard",
          textSuggestion: "THE 1% SECRET",
          contrast: "High contrast bright yellow bold text with thick black outline",
          readability: "Instant clarity across all mobile and tablet viewports",
        },
      },
      {
        id: `idea-fallback-3`,
        concept: `10 Game-Changing Tools That Every ${niche} Creator Needs Right Now`,
        targetAudience: "Operators looking to upgrade software stack and cut production overhead",
        whyRelevant: "Software roundups and tool comparisons have high long-term search volume and bookmark rates.",
        suggestedFormat: "Curated Listicle & Benchmark",
        hook: "Most creators are still using 2022 tools and wonder why their videos look outdated. Here are 10 tools that change everything.",
        suggestedTitle: `Top 10 AI Tools for ${niche} Creators in 2026 (Ranked & Tested)`,
        contentOutline: [
          "1. Intro & Selection Criteria (Speed, Output Quality, Free Tiers)",
          "2. Category 1: Idea Discovery & Trend Intelligence",
          "3. Category 2: Automated Script & Timestamp Drafting",
          "4. Category 3: High-Contrast 1280x720 Thumbnail Engines",
          "5. Category 4: Resumable Multi-Channel Publishing Hubs",
          "6. Summary Comparison Matrix & Best Free Pick",
        ],
        mainKeyword: `best ${niche.toLowerCase()} tools 2026`,
        secondaryKeywords: ["creator tools", "software comparison", "ai workflow", "production stack"],
        suggestedTags: ["creator tools", "best ai 2026", "productivity tools", "software review", "top 10"],
        thumbnailConcept: {
          mainSubject: "Grid of 3 illuminated tool logos surrounding a 10/10 rating badge",
          composition: "Central focal badge with high-voltage neon aura",
          background: "Clean dark studio texture with subtle geometric lines",
          textSuggestion: "TOP 10 RANKED",
          contrast: "Cyan and white lettering with deep navy drop shadow",
          readability: "Distinctive brand iconography readable at 120px browse size",
        },
      },
      {
        id: `idea-fallback-4`,
        concept: `From $0 to Full-Time Creator: The Complete 30-Day Blueprint for ${niche}`,
        targetAudience: "Serious creators wanting a structured, roadmap-driven approach to sustainable monetization",
        whyRelevant: "Comprehensive roadmap videos generate exceptional watch time, playlist additions, and bookmarks.",
        suggestedFormat: "Comprehensive Masterclass",
        hook: "If I lost my entire audience today and had to rebuild from zero in this niche, this is the exact 30-day schedule I would follow.",
        suggestedTitle: `The Complete ${niche} Masterclass: Zero to Full-Time in 30 Days`,
        contentOutline: [
          "1. Days 1-7: Channel Niche Positioning & Competitive Void Analysis",
          "2. Days 8-15: Content Batching, Script Frameworks & Rapid Prototyping",
          "3. Days 16-23: Thumbnail Testing, Search Engine Optimization & Community Setup",
          "4. Days 24-30: Multi-Channel Expansion, Analytics Review & Monetization Engine",
          "5. The 90-Day Compounding Forecast & Free Template Link",
        ],
        mainKeyword: `${niche.toLowerCase()} masterclass`,
        secondaryKeywords: ["full time creator", "youtube blueprint", "step by step guide", "30 day challenge"],
        suggestedTags: ["masterclass", "how to become a creator", "youtube roadmap", "channel launch", "30 day blueprint"],
        thumbnailConcept: {
          mainSubject: "Calendar graphic with days 1 through 30 crossed off with golden trophy",
          composition: "Center-aligned calendar with forward-facing creator giving thumbs up",
          background: "Clean gradient studio backdrop with warm ambient lighting",
          textSuggestion: "DAY 1 TO 30",
          contrast: "Bold gold and white typography with strong black backing pill",
          readability: "Extremely clean text hierarchy optimized for homepage feed recommendations",
        },
      },
    ],
    isHeuristicFallback: true,
    attributionNotice: `[Sandbox Engine] Heuristic trend ideas tailored for ${channelName}. Set GEMINI_API_KEY in Settings for custom generative AI.`,
  };
}

export interface CompletePackageInput {
  topic: string;
  niche?: string;
  contentType?: string;
  targetAudience?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  language?: string;
  channelContext?: ChannelContextInput;
}

export async function generateCompleteVideoPackage(input: CompletePackageInput): Promise<CompleteVideoPackage> {
  const apiKey = process.env.GEMINI_API_KEY;
  const topic = input.topic || "YouTube Creation Strategy";
  const niche = input.niche || "Content Creation";
  const audience = input.targetAudience || "YouTube Viewers";
  const contentType = input.contentType || "tutorial";
  const language = input.language || "English";
  const primaryKw = input.primaryKeyword || topic;
  const secondaryKws = input.secondaryKeywords && input.secondaryKeywords.length > 0 ? input.secondaryKeywords : ["Tutorial", "Guide", "2026"];
  const channelName = input.channelContext?.channelTitle;

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `You are the lead YouTube strategist, SEO director, and copywriter for CreatorFlow AI.
Generate a complete, cohesive, production-ready YouTube video package for:
- Video Topic: "${topic}"
- Primary Keyword: "${primaryKw}"
- Channel Niche: "${niche}"
- Content Format: "${contentType}"
- Target Audience: "${audience}"
- Language: "${language}"${channelName ? `\n- Connected Channel: "${channelName}"` : ""}

Generate all 11 core sections in a single unified response. Follow these strict rules:
1. "multipleTitles": Array of 7 distinct title variations across these exact categories: "Search-Oriented", "Curiosity-Driven", "Educational", "Tutorial", "Comparison", "Storytelling", "Short & Direct". Provide mainKeyword, approachExplanation, readability ("Fast Scan", "High Impact", etc.), and improvementTip.
2. "recommendedTitle": The single strongest performing title from the variations.
3. "completeDescription": Full description with strong hook opening, accurate summary, keywords, chapter timestamps, call to action, resources, and transparent disclaimer.
4. "primaryKeyword": Primary target search phrase.
5. "secondaryKeywords": 4-6 related search keywords.
6. "youtubeTags": 15-20 comma-separated searchable tags.
7. "hashtags": 4-5 relevant hashtags starting with #.
8. "openingHook": 0-3 second retention opening hook with strong pattern interrupt.
9. "videoOutline": 5-7 structured chapters with timestamps ("00:00", etc.) and actionable notes.
10. "thumbnailConcepts": 4 distinct concepts each with mainSubject, composition, background, visualFocus, textSuggestion (2-4 words), contrast, and readability description.
11. "additionalMetadataRecommendations": 3 actionable tips for publishing (best time, community poll idea, pinned comment).
12. "qualityScore": overall (0-100), clarity (0-100), relevance (0-100), readability (0-100), keywordCoverage (0-100), critique array.

Return ONLY a valid JSON object matching this structure:
{
  "multipleTitles": [
    {
      "title": "Title text",
      "category": "Search-Oriented",
      "mainKeyword": "...",
      "approachExplanation": "...",
      "readability": "High Impact",
      "improvementTip": "..."
    }
  ],
  "recommendedTitle": "...",
  "completeDescription": "...",
  "primaryKeyword": "...",
  "secondaryKeywords": ["kw1", "kw2"],
  "youtubeTags": ["tag1", "tag2"],
  "hashtags": ["#tag1", "#tag2"],
  "openingHook": "...",
  "videoOutline": [{"time": "00:00", "title": "...", "notes": "..."}],
  "thumbnailConcepts": [
    {
      "id": "thumb-1",
      "mainSubject": "...",
      "composition": "...",
      "background": "...",
      "visualFocus": "...",
      "textSuggestion": "...",
      "contrast": "...",
      "readability": "..."
    }
  ],
  "additionalMetadataRecommendations": ["..."],
  "qualityScore": {
    "overall": 95,
    "clarity": 96,
    "relevance": 94,
    "readability": 95,
    "keywordCoverage": 94,
    "critique": ["Strong curiosity gap in title", "High primary keyword placement"]
  }
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.recommendedTitle && parsed.completeDescription) {
          return {
            multipleTitles: Array.isArray(parsed.multipleTitles) ? parsed.multipleTitles : [],
            recommendedTitle: parsed.recommendedTitle || topic,
            completeDescription: parsed.completeDescription || "",
            primaryKeyword: parsed.primaryKeyword || primaryKw,
            secondaryKeywords: Array.isArray(parsed.secondaryKeywords) ? parsed.secondaryKeywords : secondaryKws,
            youtubeTags: Array.isArray(parsed.youtubeTags) ? parsed.youtubeTags : [],
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
            openingHook: parsed.openingHook || "",
            videoOutline: Array.isArray(parsed.videoOutline) ? parsed.videoOutline : [],
            thumbnailConcepts: Array.isArray(parsed.thumbnailConcepts) ? parsed.thumbnailConcepts : [],
            additionalMetadataRecommendations: Array.isArray(parsed.additionalMetadataRecommendations)
              ? parsed.additionalMetadataRecommendations
              : ["Optimize first 3 lines of description", "Pin an engaging discussion question in comments", "Match thumbnail text with video opening line"],
            qualityScore: parsed.qualityScore || {
              overall: 94,
              clarity: 95,
              relevance: 93,
              readability: 96,
              keywordCoverage: 92,
              critique: ["High keyword synergy across title and description", "Clear timestamp markers established"],
            },
            isHeuristicFallback: false,
            attributionNotice: `Generated via live Gemini AI (${GEMINI_MODEL})${channelName ? ` • Context: ${channelName}` : ""}.`,
          };
        }
      }
    } catch (err) {
      console.warn("generateCompleteVideoPackage API fallback:", err);
    }
  }

  // Heuristic Package Engine
  return {
    multipleTitles: [
      {
        title: `How to Master ${primaryKw} in 2026: The Complete Step-by-Step Tutorial`,
        category: "Tutorial",
        mainKeyword: primaryKw,
        approachExplanation: "Clear instructional title with year qualifier for fresh search indexing.",
        readability: "Fast Scan (Under 1s)",
        improvementTip: "Front-loads the primary keyword to maximize YouTube search ranking.",
      },
      {
        title: `The Truth About ${primaryKw} That Nobody Talks About`,
        category: "Curiosity-Driven",
        mainKeyword: primaryKw,
        approachExplanation: "Creates an intriguing curiosity gap compelling viewers who think they already understand the topic.",
        readability: "High Impact",
        improvementTip: "Pair with an expressive thumbnail face or question graphic.",
      },
      {
        title: `${primaryKw} Explained: Everything You Need to Know (Beginner to Advanced)`,
        category: "Educational",
        mainKeyword: primaryKw,
        approachExplanation: "Positions video as the definitive learning source for all skill levels.",
        readability: "High Authority",
        improvementTip: "Excellent for playlist placement and long-term search evergreen views.",
      },
      {
        title: `Why 90% of Creators Fail at ${primaryKw} (And the 10% Fix)`,
        category: "Comparison",
        mainKeyword: primaryKw,
        approachExplanation: "Leverages loss aversion and exclusivity to trigger clicks from struggling creators.",
        readability: "High Urgency",
        improvementTip: "Reinforce with a red failure vs green success visual contrast in the thumbnail.",
      },
      {
        title: `How I Scaled My Channel with ${primaryKw} (Full Architecture Breakdown)`,
        category: "Storytelling",
        mainKeyword: primaryKw,
        approachExplanation: "Case-study narrative demonstrating proven real-world results.",
        readability: "High Trust",
        improvementTip: "Show real time-spent or result metrics early in the opening.",
      },
      {
        title: `Stop Doing ${primaryKw} Like This!`,
        category: "Short & Direct",
        mainKeyword: primaryKw,
        approachExplanation: "Ultra-short, high-contrast headline that commands attention on mobile homepage feeds.",
        readability: "Instant (5 Words)",
        improvementTip: "Place contrasting warning text inside the thumbnail.",
      },
      {
        title: `${primaryKw} vs The Competition: What Actually Works in 2026?`,
        category: "Search-Oriented",
        mainKeyword: primaryKw,
        approachExplanation: "Direct search-intent alignment capturing viewers evaluating options.",
        readability: "Clear Comparison",
        improvementTip: "Great for viewers in the active consideration and decision stage.",
      },
    ],
    recommendedTitle: `How to Master ${primaryKw} in 2026: The Complete Step-by-Step Tutorial`,
    completeDescription: `Looking to master ${primaryKw}? In this comprehensive masterclass, we break down the exact production-tested framework top ${niche} creators use to achieve consistent, scalable results in 2026.

Whether you are just starting out or scaling an established channel, this breakdown covers the complete end-to-end workflow—from core principles to live execution.

TIMESTAMPS:
00:00 - The Problem with Traditional Approaches
01:45 - Core Architecture & System Setup
06:20 - Live Demonstration & Step-by-Step Walkthrough
11:50 - The 3 Biggest Mistakes to Avoid
16:15 - Pro Workflow Optimization & Scaling Tips
19:30 - Final Action Checklist & Next Steps

RESOURCES MENTIONED:
👉 CreatorFlow AI Studio: https://creatorflow.ai
👉 Step-by-Step Workflow Blueprint: https://creatorflow.ai/guides

DISCLAIMER: Content optimization and SEO metadata improve organic search discoverability and viewer relevance. Platform distribution depends on real viewer retention, satisfaction, and engagement.`,
    primaryKeyword: primaryKw,
    secondaryKeywords: [
      `${primaryKw.toLowerCase()} tutorial`,
      `${primaryKw.toLowerCase()} guide`,
      `${niche.toLowerCase()} strategy`,
      "creatorflow",
      "youtube growth 2026",
    ],
    youtubeTags: [
      primaryKw.toLowerCase(),
      `${primaryKw.toLowerCase()} tutorial`,
      `${primaryKw.toLowerCase()} guide`,
      `${primaryKw.toLowerCase()} 2026`,
      `${primaryKw.toLowerCase()} step by step`,
      `${primaryKw.toLowerCase()} for beginners`,
      niche.toLowerCase(),
      "creatorflow",
      "youtube growth",
      "content strategy",
      "workflow automation",
      "video production",
      "how to",
      "tips and tricks",
      "best practices",
    ],
    hashtags: [
      `#${primaryKw.replace(/[^a-zA-Z0-9]/g, "")}`,
      `#${niche.replace(/[^a-zA-Z0-9]/g, "")}`,
      "#YouTubeGrowth",
      "#ContentCreator",
    ],
    openingHook: `If you are still approaching ${primaryKw} the traditional way in 2026, you are wasting 80% of your time. Let me show you what the top 1% of channels are doing differently.`,
    videoOutline: [
      { time: "00:00", title: "The Problem with Traditional Approaches", notes: "Call out common creator pain points and establish the immediate value proposition" },
      { time: "01:45", title: "Core Architecture & System Setup", notes: "Walk through prerequisites and tools needed before starting execution" },
      { time: "06:20", title: "Live Demonstration & Step-by-Step Walkthrough", notes: "Screen capture demonstrating the workflow in action with live commentary" },
      { time: "11:50", title: "The 3 Biggest Mistakes to Avoid", notes: "Highlight what causes 90% of creators to drop in retention at minute 4" },
      { time: "16:15", title: "Pro Workflow Optimization & Scaling Tips", notes: "Advanced shortcuts to save 5+ hours every publishing cycle" },
      { time: "19:30", title: "Final Action Checklist & Community CTA", notes: "Summarize top 3 action items and prompt viewers for comments" },
    ],
    thumbnailConcepts: [
      {
        id: "concept-1",
        mainSubject: "Shocked creator expression pointing at a dramatic before/after efficiency metric",
        composition: "Creator portrait on right third, bold graphic on left with bright contrast line",
        background: "Deep navy studio backdrop with subtle blue rim lighting",
        visualFocus: "The dynamic contrast between old and new metrics",
        textSuggestion: "STOP DOING THIS!",
        contrast: "Bright yellow text with thick black drop shadow over dark background",
        readability: "Sub-second visual scan on mobile YouTube app home feed",
      },
      {
        id: "concept-2",
        mainSubject: "Illuminated step-by-step roadmap graphic with golden verification checkmark",
        composition: "Center-aligned visual diagram with glowing connection nodes",
        background: "AMOLED black with neon purple grid accents",
        visualFocus: "The clean structure of the 3-step master blueprint",
        textSuggestion: "2026 BLUEPRINT",
        contrast: "High-voltage neon cyan and emerald lettering",
        readability: "Sharp and crisp even when scaled down to 120px browse width",
      },
      {
        id: "concept-3",
        mainSubject: "Side-by-side split screen showing standard technique (Red X) vs secret method (Green Check)",
        composition: "50/50 horizontal split with bold vertical dividing line",
        background: "Subtle blurred workspace screenshot",
        visualFocus: "Clear binary choice creating curiosity and pattern interrupt",
        textSuggestion: "THE 1% FIX",
        contrast: "Bold white text framed inside an emerald green pill badge",
        readability: "Maximum click-through contrast against white or dark mode YouTube themes",
      },
      {
        id: "concept-4",
        mainSubject: "Extreme close-up of a critical setting or code line with magnifying glass overlay",
        composition: "Focal zoom on left with arrow indicator, creator reaction on right",
        background: "Clean dark studio texture",
        visualFocus: "The single specific insight that makes the framework work",
        textSuggestion: "SECRET METHOD",
        contrast: "Vibrant amber and white typography",
        readability: "Instant clarity creating a powerful information-gap reflex",
      },
    ],
    additionalMetadataRecommendations: [
      "Publish during your audience's peak activity window (typically 2-4 PM local channel time).",
      "Pin an open question in the comments within 5 minutes of upload to accelerate early discussion signals.",
      "Ensure the first 3 lines of your description directly echo the promise made in your title.",
      "Add the video to an existing themed playlist immediately to maximize binge watch session duration.",
    ],
    qualityScore: {
      overall: 93,
      clarity: 95,
      relevance: 92,
      readability: 96,
      keywordCoverage: 91,
      critique: [
        "[Sandbox Engine] Generated using production heuristic schema templates. Configure GEMINI_API_KEY in Settings for custom live AI.",
        "Primary keyword is strategically front-loaded in title variations and reinforced in description opening.",
        "Structured chapter timestamps enable Google Search Key Moments and YouTube chapter indexing.",
        "SEO Transparency Notice: Metadata optimizes organic discoverability; platform reach depends on viewer retention.",
      ],
    },
    isHeuristicFallback: true,
    attributionNotice: `[Sandbox Engine] Production-grade heuristic package${channelName ? ` tailored for ${channelName}` : ""}. Connect GEMINI_API_KEY in Settings for custom generative AI.`,
  };
}

// ---------------------------------------------------------------------------
// Phase 2.7: AI Thumbnail Studio Engine (Long-Form 16:9 & Shorts 9:16)
// ---------------------------------------------------------------------------

export interface ThumbnailGenerationInput {
  videoTitle?: string;
  topic: string;
  description?: string;
  tags?: string[];
  niche?: string;
  format?: "long_form" | "shorts";
  targetAudience?: string;
  channelContext?: ChannelContextInput;
}

export interface ThumbnailConceptItem {
  id: string;
  name: string;
  category: "Curiosity Gap" | "Before & After" | "Shock & Proof" | "Extreme Contrast" | "Minimal Intrigue";
  textOverlay: string;
  accentColor: string;
  visualDescription: string;
  aiImagePrompt: string;
  layoutComposition: string;
  estimatedCTR: "Very High" | "High" | "High Momentum";
  suggestedBackgroundUrl?: string;
}

export interface ThumbnailGenerationOutput {
  format: "long_form" | "shorts";
  aspectRatio: "16:9" | "9:16";
  dimensions: { width: number; height: number };
  safeZoneAdvice: string;
  recommendedText: string;
  recommendedColor: string;
  concepts: ThumbnailConceptItem[];
  isHeuristicFallback: boolean;
  attributionNotice: string;
}

export async function generateThumbnailAI(input: ThumbnailGenerationInput): Promise<ThumbnailGenerationOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isShorts = input.format === "shorts";
  const formatName = isShorts ? "YouTube Shorts (9:16 Vertical)" : "YouTube Long-Form (16:9 Horizontal)";
  const dimensions = isShorts ? { width: 1080, height: 1920 } : { width: 1280, height: 720 };
  const safeZoneAdvice = isShorts
    ? "SHORTS SAFE ZONE: Keep all critical text and focal faces centered between 20% and 70% vertical height. Avoid right side (15% reserved for Like/Comment/Share buttons) and bottom 25% (reserved for sound, handle, and video title)."
    : "LONG-FORM SAFE ZONE: Follow the rule of thirds. Avoid placing critical text in the bottom right corner (reserved for the YouTube timestamp duration pill). Place focal face/subject on left or right third.";

  const topic = input.topic || input.videoTitle || "Untitled Video";
  const niche = input.niche || "Tech & Creation";
  const targetAudience = input.targetAudience || "YouTube Creators and Viewers";

  if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && !apiKey.startsWith("placeholder")) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `You are an elite YouTube thumbnail designer and CTR growth scientist for CreatorFlow AI.
Analyze the following video metadata and create 4 high-CTR thumbnail concepts specifically designed for ${formatName}.

VIDEO METADATA:
- Topic / Premise: "${topic}"
- Selected Title: "${input.videoTitle || topic}"
- Description: "${input.description ? input.description.slice(0, 300) : "Not provided"}"
- Tags / Keywords: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "niche, viral, 2026"}
- Content Niche: "${niche}"
- Format: "${formatName}"
- Target Audience: "${targetAudience}"
- Channel: "${input.channelContext?.channelTitle || "Creator Channel"}"

DESIGN RULES FOR ${isShorts ? "SHORTS (9:16)" : "LONG-FORM (16:9)"}:
${
  isShorts
    ? `1. Format is 9:16 VERTICAL.
2. Text overlay must be ULTRA-SHORT (1-3 words max, e.g. "DON'T DO THIS", "10X SECRET", "HUGE MISTAKE", "WATCH THIS").
3. Vertical Composition: High-energy vertical framing with subject in middle 60%.
4. Text Accent Colors: Vibrant neon contrast (#FACC15 Yellow, #38BDF8 Cyan, #4ADE80 Emerald, #F87171 Red).
5. For each concept, provide an "aiImagePrompt" engineered for modern image models (Midjourney, DALL-E 3, Imagen, Flux) with lighting, camera angle, and background details.`
    : `1. Format is 16:9 HORIZONTAL.
2. Text overlay must be punchy (2-4 words max, e.g. "I AUTOMATED IT!", "THE 1% SECRET", "FIREBASE IS DEAD?", "2026 METHOD").
3. Horizontal Composition: Subject on right/left third, high contrast graphic on opposite third, dark gradient backing.
4. For each concept, provide an "aiImagePrompt" engineered for modern image models with lighting, composition, and mood.`
}

Return ONLY a valid JSON object matching this exact structure:
{
  "recommendedText": "PUNCHY 2-3 WORD TEXT",
  "recommendedColor": "#FACC15",
  "concepts": [
    {
      "id": "concept-1",
      "name": "Curiosity Gap",
      "category": "Curiosity Gap",
      "textOverlay": "2-3 WORDS",
      "accentColor": "#FACC15",
      "visualDescription": "Detailed visual description of subjects, colors, and layout.",
      "aiImagePrompt": "Cinematic 8k photorealistic prompt with lighting, depth of field, and styling details.",
      "layoutComposition": "Composition placement and focal notes.",
      "estimatedCTR": "Very High"
    },
    {
      "id": "concept-2",
      "name": "Split Contrast",
      "category": "Before & After",
      "textOverlay": "BEFORE vs AFTER",
      "accentColor": "#38BDF8",
      "visualDescription": "...",
      "aiImagePrompt": "...",
      "layoutComposition": "...",
      "estimatedCTR": "Very High"
    },
    {
      "id": "concept-3",
      "name": "Shock Proof",
      "category": "Shock & Proof",
      "textOverlay": "100x RESULTS",
      "accentColor": "#4ADE80",
      "visualDescription": "...",
      "aiImagePrompt": "...",
      "layoutComposition": "...",
      "estimatedCTR": "High"
    },
    {
      "id": "concept-4",
      "name": "Urgent Warning",
      "category": "Extreme Contrast",
      "textOverlay": "STOP DOING THIS",
      "accentColor": "#F87171",
      "visualDescription": "...",
      "aiImagePrompt": "...",
      "layoutComposition": "...",
      "estimatedCTR": "High Momentum"
    }
  ]
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);

      const backgroundPool = isShorts
        ? [
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&h=1920&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1920&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&h=1920&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&h=1920&auto=format&fit=crop&q=80",
          ]
        : [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1280&auto=format&fit=crop&q=80",
          ];

      const concepts: ThumbnailConceptItem[] = Array.isArray(parsed.concepts)
        ? parsed.concepts.map((c: any, idx: number) => ({
            id: c.id || `concept-${idx + 1}`,
            name: c.name || `Concept ${idx + 1}`,
            category: c.category || "Curiosity Gap",
            textOverlay: (c.textOverlay || "NEW METHOD").toUpperCase(),
            accentColor: c.accentColor || "#FACC15",
            visualDescription: c.visualDescription || "High-impact visual composition.",
            aiImagePrompt: c.aiImagePrompt || `Cinematic photorealistic shot of ${topic}, dramatic lighting, 8k.`,
            layoutComposition: c.layoutComposition || (isShorts ? "Centered vertical focal point" : "Rule of thirds"),
            estimatedCTR: c.estimatedCTR || "Very High",
            suggestedBackgroundUrl: backgroundPool[idx % backgroundPool.length],
          }))
        : [];

        if (concepts.length > 0) {
          return {
            format: isShorts ? "shorts" : "long_form",
            aspectRatio: isShorts ? "9:16" : "16:9",
            dimensions,
            safeZoneAdvice,
            recommendedText: (parsed.recommendedText || concepts[0].textOverlay).toUpperCase(),
            recommendedColor: parsed.recommendedColor || concepts[0].accentColor,
            concepts,
            isHeuristicFallback: false,
            attributionNotice: `[Live Gemini AI] Tailored for ${formatName} based on video metadata.`,
          };
        }
      }
    } catch (err) {
      console.warn("Live Gemini thumbnail generation failed, using heuristic engine:", err);
    }
  }

  return generateHeuristicThumbnails(input);
}

function generateHeuristicThumbnails(input: ThumbnailGenerationInput): ThumbnailGenerationOutput {
  const isShorts = input.format === "shorts";
  const topic = input.topic || input.videoTitle || "Creator Blueprint";
  const kw = topic.split(" ").slice(0, 3).join(" ").toUpperCase();
  const dimensions = isShorts ? { width: 1080, height: 1920 } : { width: 1280, height: 720 };
  const safeZoneAdvice = isShorts
    ? "SHORTS SAFE ZONE: Keep all critical text and focal faces centered between 20% and 70% vertical height. Avoid right side (15% reserved for Like/Comment/Share buttons) and bottom 25% (reserved for sound, handle, and video title)."
    : "LONG-FORM SAFE ZONE: Follow the rule of thirds. Avoid placing critical text in the bottom right corner (reserved for the YouTube timestamp duration pill). Place focal face/subject on left or right third.";

  const backgroundPool = isShorts
    ? [
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&h=1920&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1920&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&h=1920&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&h=1920&auto=format&fit=crop&q=80",
      ]
    : [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1280&auto=format&fit=crop&q=80",
      ];

  const concepts: ThumbnailConceptItem[] = isShorts
    ? [
        {
          id: "concept-shorts-1",
          name: "High Curiosity Hook",
          category: "Curiosity Gap",
          textOverlay: "STOP THIS!",
          accentColor: "#FACC15",
          visualDescription: `Vertical centered frame with vibrant neon rim light focusing on an unexpected revelation about ${topic}.`,
          aiImagePrompt: `Vertical 9:16 aspect ratio, dramatic close-up subject with shocked expression looking directly at camera, holding an unexpected glowing neon prop related to ${topic}, dark futuristic aesthetic, high contrast, cinematic octane render, 8k.`,
          layoutComposition: "Upper-center placement (35% from top), avoiding bottom 25% sound overlay",
          estimatedCTR: "Very High",
          suggestedBackgroundUrl: backgroundPool[0],
        },
        {
          id: "concept-shorts-2",
          name: "10x Speed Transformation",
          category: "Before & After",
          textOverlay: "10X FASTER",
          accentColor: "#38BDF8",
          visualDescription: `Top/bottom vertical split with glowing divider comparing the slow legacy method vs the instant new technique.`,
          aiImagePrompt: `Vertical 9:16 layout, top half shows cluttered messy setup in dim lighting, bottom half shows immaculate ultra-fast automated flow with glowing cyan accents, sharp contrast, cinematic lighting, photorealistic.`,
          layoutComposition: "Stacked vertical comparison, text badge pinned in upper third",
          estimatedCTR: "Very High",
          suggestedBackgroundUrl: backgroundPool[1],
        },
        {
          id: "concept-shorts-3",
          name: "The Secret Metric",
          category: "Shock & Proof",
          textOverlay: "$0 TO $10K",
          accentColor: "#4ADE80",
          visualDescription: `Vertical full-bleed mobile display highlighting an exponential growth curve and verified checkmark.`,
          aiImagePrompt: `Vertical 9:16 composition, hyper-detailed graph skyrocketing upward with emerald green particle trails, studio portrait of confident creator pointing toward the chart, shallow depth of field, 8k resolution.`,
          layoutComposition: "Center-aligned graphic with creator in background",
          estimatedCTR: "High",
          suggestedBackgroundUrl: backgroundPool[2],
        },
        {
          id: "concept-shorts-4",
          name: "Fatal Mistake Warning",
          category: "Extreme Contrast",
          textOverlay: "BIGGEST MISTAKE",
          accentColor: "#F87171",
          visualDescription: `High-voltage red warning motif with bold typography commanding immediate scroll-stopping urgency.`,
          aiImagePrompt: `Vertical 9:16 framed shot, bold red warning icon glowing with volumetric smoke, dramatic rim lighting on creator face, intense cinematic mood, hyper-detailed.`,
          layoutComposition: "Upper third text banner with dramatic subject below",
          estimatedCTR: "High Momentum",
          suggestedBackgroundUrl: backgroundPool[3],
        },
      ]
    : [
        {
          id: "concept-long-1",
          name: "High Curiosity Gap",
          category: "Curiosity Gap",
          textOverlay: "I AUTOMATED IT!",
          accentColor: "#FACC15",
          visualDescription: `Dramatic subject portrait on right third with glowing question graphic on left third against a deep navy studio backdrop.`,
          aiImagePrompt: `Cinematic 16:9 shot, expressive creator on right third looking at a glowing holographic interface showing ${topic}, volumetric blue and purple studio rim lighting, 50mm lens f/1.8, photorealistic 8k.`,
          layoutComposition: "Subject on right third, bold text and graphics on left third",
          estimatedCTR: "Very High",
          suggestedBackgroundUrl: backgroundPool[0],
        },
        {
          id: "concept-long-2",
          name: "Split Before & After",
          category: "Before & After",
          textOverlay: "STOP CODING SLOW",
          accentColor: "#38BDF8",
          visualDescription: `Side-by-side 50/50 split comparing the painful manual grind with the instant AI automated result.`,
          aiImagePrompt: `16:9 split screen comparison, left side desaturated with red X showing tedious manual process, right side vibrant cyan with green checkmark showing lightning-fast automated solution, hyper-detailed.`,
          layoutComposition: "Split screen horizontal layout with bold center text",
          estimatedCTR: "Very High",
          suggestedBackgroundUrl: backgroundPool[1],
        },
        {
          id: "concept-long-3",
          name: "Curiosity Mystery Gap",
          category: "Shock & Proof",
          textOverlay: `${kw} DEAD?`,
          accentColor: "#F87171",
          visualDescription: `Single bold question with blurred background interface creating an irresistible information vacuum.`,
          aiImagePrompt: `16:9 minimalist dramatic composition, dark textured background with high-key spotlight on critical tech icon, red warning border, clean studio lighting, 8k.`,
          layoutComposition: "Center-left punchline with high-key lighting",
          estimatedCTR: "High",
          suggestedBackgroundUrl: backgroundPool[2],
        },
        {
          id: "concept-long-4",
          name: "The 2026 Master Formula",
          category: "Minimal Intrigue",
          textOverlay: "THE 1% BLUEPRINT",
          accentColor: "#4ADE80",
          visualDescription: `Clean high-authority blueprint diagram with glowing nodes and prominent emerald pill badge.`,
          aiImagePrompt: `16:9 architectural blueprint visualization of ${topic}, glowing connection nodes on dark AMOLED background, crisp sharp lines, cinematic tech aesthetic, 8k.`,
          layoutComposition: "Right-aligned diagram with left-aligned bold text",
          estimatedCTR: "High Momentum",
          suggestedBackgroundUrl: backgroundPool[3],
        },
      ];

  return {
    format: isShorts ? "shorts" : "long_form",
    aspectRatio: isShorts ? "9:16" : "16:9",
    dimensions,
    safeZoneAdvice,
    recommendedText: concepts[0].textOverlay,
    recommendedColor: concepts[0].accentColor,
    concepts,
    isHeuristicFallback: true,
    attributionNotice: `[Sandbox Engine] Heuristic concepts designed for ${isShorts ? "YouTube Shorts" : "Long-Form"}. Configure GEMINI_API_KEY in Settings for custom generative AI.`,
  };
}

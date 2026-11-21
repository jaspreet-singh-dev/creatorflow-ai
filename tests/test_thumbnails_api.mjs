async function testThumbnails() {
  console.log("Testing POST /api/ai/thumbnails with real metadata...");

  // 1. Long Form test
  const longFormRes = await fetch("http://localhost:3000/api/ai/thumbnails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer demo-session",
    },
    body: JSON.stringify({
      topic: "How to Build Autonomous AI Agents in Next.js",
      videoTitle: "How I Built an Autonomous AI Agent in 24 Hours",
      description: "Full architectural breakdown of agent tool calling and loop execution.",
      tags: ["ai", "agents", "nextjs", "coding"],
      niche: "Tech & Software",
      format: "long_form",
      targetAudience: "Software engineers and creators",
    }),
  });

  console.log("Long Form Status:", longFormRes.status);
  const longData = await longFormRes.json();
  console.log("Long Form Success:", longData.success);
  console.log("Aspect Ratio:", longData.data?.aspectRatio);
  console.log("Recommended Text:", longData.data?.recommendedText);
  console.log("Concepts Count:", longData.data?.concepts?.length);
  console.log("First Concept:", longData.data?.concepts?.[0]?.name, "-", longData.data?.concepts?.[0]?.textOverlay);

  // 2. Shorts test
  console.log("\nTesting Shorts format (9:16)...");
  const shortsRes = await fetch("http://localhost:3000/api/ai/thumbnails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer demo-session",
    },
    body: JSON.stringify({
      topic: "Stop Using Console Log in JavaScript",
      videoTitle: "3 Debugger Tricks You Wish You Knew Sooner #shorts",
      description: "Quick 45s breakdown of Chrome DevTools memory inspection.",
      tags: ["javascript", "shorts", "debugging", "webdev"],
      niche: "Coding Hacks",
      format: "shorts",
      targetAudience: "Junior to senior developers",
    }),
  });

  console.log("Shorts Status:", shortsRes.status);
  const shortsData = await shortsRes.json();
  console.log("Shorts Success:", shortsData.success);
  console.log("Aspect Ratio:", shortsData.data?.aspectRatio);
  console.log("Recommended Text:", shortsData.data?.recommendedText);
  console.log("Safe Zone Advice:", shortsData.data?.safeZoneAdvice?.slice(0, 50) + "...");
  console.log("First Shorts Concept:", shortsData.data?.concepts?.[0]?.name, "-", shortsData.data?.concepts?.[0]?.textOverlay);
  console.log("AI Image Prompt:", shortsData.data?.concepts?.[0]?.aiImagePrompt?.slice(0, 80) + "...");
}

testThumbnails().catch(console.error);

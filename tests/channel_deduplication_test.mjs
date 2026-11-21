// Unit test for channel deduplication logic in CreatorFlow AI
import assert from "assert";

function deduplicateChannels(channelsList) {
  if (!Array.isArray(channelsList)) return [];

  const seenIds = new Set();
  const seenYtIds = new Set();
  const seenHandles = new Set();
  const seenTitles = new Set();

  return channelsList.filter((ch) => {
    if (!ch) return false;

    // 1. Unique by internal DB / local ID
    if (ch.id) {
      if (seenIds.has(ch.id)) return false;
      seenIds.add(ch.id);
    }

    // 2. Unique by real YouTube Channel ID (e.g. UC...)
    if (ch.youtube_channel_id) {
      const normalizedYtId = ch.youtube_channel_id.trim();
      if (normalizedYtId && seenYtIds.has(normalizedYtId)) return false;
      if (normalizedYtId) seenYtIds.add(normalizedYtId);
    }

    // 3. Unique by custom URL / handle (e.g. @NoVoiceCraft)
    if (ch.custom_url) {
      const normalizedHandle = ch.custom_url.trim().toLowerCase();
      if (normalizedHandle && seenHandles.has(normalizedHandle)) return false;
      if (normalizedHandle) seenHandles.add(normalizedHandle);
    }

    // 4. Unique by title (case-insensitive) to prevent duplicate visual entries
    if (ch.title) {
      const normalizedTitle = ch.title.trim().toLowerCase();
      if (normalizedTitle && seenTitles.has(normalizedTitle)) return false;
      if (normalizedTitle) seenTitles.add(normalizedTitle);
    }

    return true;
  });
}

function simulateAddChannel(prev, channel) {
  const existingIdx = prev.findIndex((c) => {
    if (c.id === channel.id) return true;
    if (
      c.youtube_channel_id &&
      channel.youtube_channel_id &&
      c.youtube_channel_id.trim() === channel.youtube_channel_id.trim()
    ) {
      return true;
    }
    if (
      c.custom_url &&
      channel.custom_url &&
      c.custom_url.trim().toLowerCase() === channel.custom_url.trim().toLowerCase()
    ) {
      return true;
    }
    if (
      c.title &&
      channel.title &&
      c.title.trim().toLowerCase() === channel.title.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  if (existingIdx >= 0) {
    const existing = prev[existingIdx];
    const merged = {
      ...existing,
      ...channel,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };
    const rest = prev.filter((_, idx) => idx !== existingIdx);
    return deduplicateChannels([merged, ...rest]);
  } else {
    return deduplicateChannels([channel, ...prev]);
  }
}

console.log("--- Starting Channel Deduplication Tests ---");

// Test 1: User's exact scenario from screenshot
const userChannelsState = [
  {
    id: "chan-1732179000000",
    title: "NoVoiceCraft",
    custom_url: "@NoVoiceCraft",
    youtube_channel_id: "UC_user_novocraft",
    subscriber_count: 335,
  },
  {
    id: "chan-1732179005000",
    title: "NoVoiceCraft",
    custom_url: "@NoVoiceCraft",
    youtube_channel_id: "UC_user_novocraft",
    subscriber_count: 335,
  },
  {
    id: "chan-demo-1",
    title: "AI Horizons Tech",
    custom_url: "@AIHorizons",
    youtube_channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    subscriber_count: 148500,
  },
  {
    id: "chan-demo-2",
    title: "Nexus Code & Cloud",
    custom_url: "@NexusCode",
    youtube_channel_id: "UC_y7Y8z90abcdefghijklm",
    subscriber_count: 32400,
  },
];

const deduplicated = deduplicateChannels(userChannelsState);
console.log(`Original count: ${userChannelsState.length}, Deduplicated count: ${deduplicated.length}`);
assert.strictEqual(deduplicated.length, 3, "Expected exactly 3 channels after deduplicating NoVoiceCraft duplicate");
assert.strictEqual(deduplicated[0].title, "NoVoiceCraft");
assert.strictEqual(deduplicated[1].title, "AI Horizons Tech");
assert.strictEqual(deduplicated[2].title, "Nexus Code & Cloud");
console.log("PASS: Test 1 - Exact duplicate NoVoiceCraft channel removed");

// Test 2: Duplicate with different ID but same handle (different casing)
const duplicateByHandle = [
  { id: "1", title: "Channel A", custom_url: "@myhandle" },
  { id: "2", title: "Channel A Alternate", custom_url: "@MYHANDLE" },
];
const resultHandle = deduplicateChannels(duplicateByHandle);
assert.strictEqual(resultHandle.length, 1);
console.log("PASS: Test 2 - Duplicate by case-insensitive handle removed");

// Test 3: Duplicate with different ID and handle but same YouTube channel ID
const duplicateByYtId = [
  { id: "1", title: "Channel A", youtube_channel_id: "UC12345" },
  { id: "2", title: "Channel B", youtube_channel_id: "UC12345" },
];
const resultYt = deduplicateChannels(duplicateByYtId);
assert.strictEqual(resultYt.length, 1);
console.log("PASS: Test 3 - Duplicate by youtube_channel_id removed");

// Test 4: Duplicate by title (case-insensitive + whitespace)
const duplicateByTitle = [
  { id: "1", title: "NoVoiceCraft", custom_url: "" },
  { id: "2", title: "  novoicecraft  ", custom_url: "" },
];
const resultTitle = deduplicateChannels(duplicateByTitle);
assert.strictEqual(resultTitle.length, 1);
console.log("PASS: Test 4 - Duplicate by case-insensitive title removed");

// Test 5: In-place update preserving stable ID
const currentList = [
  { id: "chan-orig-1", title: "NoVoiceCraft", subscriber_count: 335, youtube_channel_id: "UC_novoice" },
  { id: "chan-demo-1", title: "AI Horizons Tech", subscriber_count: 148500 },
];
const incomingUpdate = {
  id: "chan-new-temp",
  title: "NoVoiceCraft",
  subscriber_count: 350,
  youtube_channel_id: "UC_novoice",
};
const updatedList = simulateAddChannel(currentList, incomingUpdate);
assert.strictEqual(updatedList.length, 2);
assert.strictEqual(updatedList[0].id, "chan-orig-1", "Original ID should be retained during update");
assert.strictEqual(updatedList[0].subscriber_count, 350, "Updated subscriber count should take effect");
console.log("PASS: Test 5 - In-place channel update preserves stable ID and updates stats");

console.log("--- All Channel Deduplication Tests Passed! ---");

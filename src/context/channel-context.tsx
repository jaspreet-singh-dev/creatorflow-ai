"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { ConnectedChannel } from "@/types/database.types";
import { useAuth } from "./auth-context";
import { createClient } from "@/lib/supabase/client";

interface ChannelContextType {
  channels: ConnectedChannel[];
  activeChannel: ConnectedChannel | null;
  isLoadingChannels: boolean;
  setActiveChannel: (channel: ConnectedChannel) => void;
  refreshChannels: () => Promise<void>;
  addChannelLocally: (channel: ConnectedChannel) => void;
  deleteChannel: (id: string) => Promise<void>;
  syncChannelStats: (id: string) => Promise<void>;
}

const DEFAULT_DEMO_CHANNELS: ConnectedChannel[] = [
  {
    id: "chan-demo-1",
    user_id: "demo-user-123456",
    youtube_channel_id: "UC_novoicecraft_official",
    title: "NoVoiceCraft",
    custom_url: "@novoice_craft",
    thumbnail_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
    subscriber_count: 335,
    video_count: 134,
    view_count: 619466,
    is_active: true,
    created_at: "2025-05-19T00:00:00.000Z",
    updated_at: new Date().toISOString(),
  },
];

export function deduplicateChannels(channelsList: ConnectedChannel[]): ConnectedChannel[] {
  if (!Array.isArray(channelsList)) return [];

  const legacyBlockedHandles = new Set(["aihorizons", "nexuscode", "aihorizonstech"]);
  const legacyBlockedTitles = new Set(["ai horizons tech", "nexus code & cloud", "ai horizons"]);

  const seenIds = new Set<string>();
  const seenYtIds = new Set<string>();
  const seenHandles = new Set<string>();
  const seenTitles = new Set<string>();

  const result: ConnectedChannel[] = [];

  for (const ch of channelsList) {
    if (!ch) continue;

    const id = (ch.id || "").trim();
    const ytId = (ch.youtube_channel_id || "").trim();
    const handle = (ch.custom_url || "").trim().toLowerCase().replace(/^@/, "");
    const title = (ch.title || "").trim().toLowerCase().replace(/\s+/g, " ");

    // Remove legacy generic channels if they linger in user's localStorage
    if (legacyBlockedHandles.has(handle) || legacyBlockedTitles.has(title)) {
      continue;
    }

    const isDuplicate =
      (id && seenIds.has(id)) ||
      (ytId && seenYtIds.has(ytId)) ||
      (handle && seenHandles.has(handle)) ||
      (title && seenTitles.has(title));

    if (isDuplicate) {
      continue;
    }

    if (id) seenIds.add(id);
    if (ytId) seenYtIds.add(ytId);
    if (handle) seenHandles.add(handle);
    if (title) seenTitles.add(title);

    result.push(ch);
  }

  return result;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [activeChannel, setActiveChannelState] = useState<ConnectedChannel | null>(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const setActiveChannel = useCallback((channel: ConnectedChannel) => {
    setActiveChannelState(channel);
    try {
      localStorage.setItem("cf_active_channel_id", channel.id);
    } catch (e) {
      // ignore
    }
  }, []);

  const getStorageKey = useCallback(() => {
    if (!user || isDemoMode) return "cf_channels_v1";
    return `cf_channels_user_${user.id}`;
  }, [user, isDemoMode]);

  const saveChannelsToStorage = useCallback((chans: ConnectedChannel[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(chans));
      if (isDemoMode) {
        localStorage.setItem("cf_channels_v1", JSON.stringify(chans));
      }
    } catch (e) {
      console.warn("Could not save channels to localStorage", e);
    }
  }, [getStorageKey, isDemoMode]);

  const persistChannels = useCallback((newChannels: ConnectedChannel[]) => {
    const deduplicated = deduplicateChannels(newChannels);
    saveChannelsToStorage(deduplicated);
    setChannels(deduplicated);
  }, [saveChannelsToStorage]);

  const fetchChannels = useCallback(async () => {
    if (!user) {
      setChannels([]);
      setActiveChannelState(null);
      setIsLoadingChannels(false);
      return;
    }

    if (isDemoMode) {
      const saved = localStorage.getItem("cf_channels_v1");
      const loaded: ConnectedChannel[] = saved ? JSON.parse(saved) : DEFAULT_DEMO_CHANNELS;
      const deduplicated = deduplicateChannels(loaded);
      if (saved && deduplicated.length !== loaded.length) {
        try {
          localStorage.setItem("cf_channels_v1", JSON.stringify(deduplicated));
        } catch {
          // ignore storage error
        }
      }
      setChannels(deduplicated);

      const savedActiveId = localStorage.getItem("cf_active_channel_id");
      const matched = deduplicated.find((c) => c.id === savedActiveId);
      setActiveChannelState(matched || deduplicated[0] || null);
      setIsLoadingChannels(false);
      return;
    }

    const hasSupabaseUrl = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (hasSupabaseUrl) {
      try {
        setIsLoadingChannels(true);
        const { data, error } = await supabase
          .from("connected_channels")
          .select("id, user_id, youtube_channel_id, title, custom_url, thumbnail_url, subscriber_count, video_count, view_count, is_active, created_at, updated_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0 && !error) {
          const deduplicated = deduplicateChannels(data as ConnectedChannel[]);
          setChannels(deduplicated);
          const savedActiveId = localStorage.getItem("cf_active_channel_id");
          const matched = deduplicated.find((c) => c.id === savedActiveId);
          setActiveChannelState(matched || deduplicated[0] || null);
          setIsLoadingChannels(false);
          return;
        }
      } catch (e) {
        console.warn("Could not load channels from DB, checking local store:", e);
      }
    }

    // Local account store
    try {
      const userKey = `cf_channels_user_${user.id}`;
      const savedUserChannels = localStorage.getItem(userKey);
      if (savedUserChannels) {
        const loaded: ConnectedChannel[] = JSON.parse(savedUserChannels);
        const deduplicated = deduplicateChannels(loaded);
        if (deduplicated.length !== loaded.length) {
          try {
            localStorage.setItem(userKey, JSON.stringify(deduplicated));
          } catch {
            // ignore storage error
          }
        }
        setChannels(deduplicated);
        const savedActiveId = localStorage.getItem("cf_active_channel_id");
        const matched = deduplicated.find((c) => c.id === savedActiveId);
        setActiveChannelState(matched || deduplicated[0] || null);
      } else {
        // Fresh user starts with empty channels list ready for their real channel
        setChannels([]);
        setActiveChannelState(null);
      }
    } catch (e) {
      setChannels([]);
      setActiveChannelState(null);
    } finally {
      setIsLoadingChannels(false);
    }
  }, [user, isDemoMode, supabase]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const addChannelLocally = useCallback((channel: ConnectedChannel) => {
    let targetActiveChannel = channel;
    setChannels((prev) => {
      const channelYtId = (channel.youtube_channel_id || "").trim();
      const channelHandle = (channel.custom_url || "").trim().toLowerCase().replace(/^@/, "");
      const channelTitle = (channel.title || "").trim().toLowerCase().replace(/\s+/g, " ");

      // Find if this channel already exists in the list
      const existingIdx = prev.findIndex((c) => {
        if (c.id === channel.id) return true;
        if (channelYtId && c.youtube_channel_id && c.youtube_channel_id.trim() === channelYtId) return true;
        if (channelHandle && c.custom_url && c.custom_url.trim().toLowerCase().replace(/^@/, "") === channelHandle) return true;
        if (channelTitle && c.title && c.title.trim().toLowerCase().replace(/\s+/g, " ") === channelTitle) return true;
        return false;
      });

      let updated: ConnectedChannel[];
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const merged: ConnectedChannel = {
          ...existing,
          ...channel,
          id: existing.id,
          updated_at: new Date().toISOString(),
        };
        targetActiveChannel = merged;
        const rest = prev.filter((_, idx) => idx !== existingIdx);
        updated = deduplicateChannels([merged, ...rest]);
      } else {
        updated = deduplicateChannels([channel, ...prev]);
      }

      saveChannelsToStorage(updated);
      return updated;
    });

    setActiveChannel(targetActiveChannel);
  }, [saveChannelsToStorage, setActiveChannel]);

  const deleteChannel = useCallback(async (id: string) => {
    setChannels((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveChannelsToStorage(updated);
      if (activeChannel?.id === id) {
        setActiveChannelState(updated[0] || null);
      }
      return updated;
    });

    if (user && !isDemoMode) {
      await supabase.from("connected_channels").delete().eq("id", id);
    }
  }, [activeChannel, user, isDemoMode, saveChannelsToStorage, supabase]);

  const syncChannelStats = useCallback(async (id: string) => {
    const targetChannel = channels.find((c) => c.id === id);
    if (!targetChannel) return;

    let realStats: any = null;
    if (targetChannel.custom_url) {
      try {
        const res = await fetch("/api/youtube/channel-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handleOrUrl: targetChannel.custom_url }),
        });
        const data = await res.json();
        if (data.success && data.channel) {
          realStats = data.channel;
        }
      } catch (err) {
        console.warn("Could not fetch live sync stats from YouTube:", err);
      }
    }

    setChannels((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          if (realStats) {
            return {
              ...c,
              subscriber_count: realStats.subscriber_count || c.subscriber_count,
              video_count: realStats.video_count || c.video_count,
              view_count: realStats.view_count || c.view_count,
              thumbnail_url: realStats.thumbnail_url || c.thumbnail_url,
              updated_at: new Date().toISOString(),
            };
          }
          // If live sync is not available, preserve verified statistics without fabricating fake numbers
          return {
            ...c,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      });
      persistChannels(updated);
      return updated;
    });
  }, [channels, persistChannels]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        activeChannel,
        isLoadingChannels,
        setActiveChannel,
        refreshChannels: fetchChannels,
        addChannelLocally,
        deleteChannel,
        syncChannelStats,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}

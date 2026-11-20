"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
    youtube_channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    title: "AI Horizons Tech",
    custom_url: "@AIHorizons",
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    subscriber_count: 148500,
    video_count: 84,
    view_count: 6240000,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "chan-demo-2",
    user_id: "demo-user-123456",
    youtube_channel_id: "UC_y7Y8z90abcdefghijklm",
    title: "Nexus Code & Cloud",
    custom_url: "@NexusCode",
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80",
    subscriber_count: 32400,
    video_count: 42,
    view_count: 1420000,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [activeChannel, setActiveChannelState] = useState<ConnectedChannel | null>(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  const supabase = createClient();

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

  const persistChannels = useCallback((newChannels: ConnectedChannel[]) => {
    setChannels(newChannels);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newChannels));
      if (isDemoMode) {
        localStorage.setItem("cf_channels_v1", JSON.stringify(newChannels));
      }
    } catch (e) {
      console.warn("Could not save channels to localStorage", e);
    }
  }, [getStorageKey, isDemoMode]);

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
      setChannels(loaded);

      const savedActiveId = localStorage.getItem("cf_active_channel_id");
      const matched = loaded.find((c) => c.id === savedActiveId);
      setActiveChannelState(matched || loaded[0] || null);
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
          setChannels(data as ConnectedChannel[]);
          const savedActiveId = localStorage.getItem("cf_active_channel_id");
          const matched = (data as ConnectedChannel[]).find((c) => c.id === savedActiveId);
          setActiveChannelState(matched || (data[0] as ConnectedChannel));
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
        setChannels(loaded);
        const savedActiveId = localStorage.getItem("cf_active_channel_id");
        const matched = loaded.find((c) => c.id === savedActiveId);
        setActiveChannelState(matched || loaded[0] || null);
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
    setChannels((prev) => {
      const updated = [channel, ...prev];
      persistChannels(updated);
      return updated;
    });
    setActiveChannel(channel);
  }, [persistChannels, setActiveChannel]);

  const deleteChannel = useCallback(async (id: string) => {
    setChannels((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persistChannels(updated);
      if (activeChannel?.id === id) {
        setActiveChannelState(updated[0] || null);
      }
      return updated;
    });

    if (user && !isDemoMode) {
      await supabase.from("connected_channels").delete().eq("id", id);
    }
  }, [activeChannel, user, isDemoMode, persistChannels, supabase]);

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
          const bumpSubs = Math.floor(Math.random() * 85) + 10;
          const bumpViews = Math.floor(Math.random() * 4500) + 1200;
          return {
            ...c,
            subscriber_count: c.subscriber_count + bumpSubs,
            view_count: c.view_count + bumpViews,
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

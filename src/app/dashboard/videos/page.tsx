"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Search,
  ExternalLink,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Plus,
  Play,
  Film,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";

interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt?: string;
  published_at?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  channelTitle?: string;
  viewCount?: number;
  views?: number;
  likeCount?: number;
  likes?: number;
  commentCount?: number;
  comments?: number;
  privacyStatus?: string;
  privacy_status?: string;
  duration_formatted?: string;
  video_url?: string;
}

export default function ChannelVideosPage() {
  const router = useRouter();
  const { activeChannel, channels } = useChannel();
  const { addProject } = useData();

  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChannelVideos = React.useCallback(async () => {
    if (!activeChannel) return;
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const channelId = activeChannel.youtube_channel_id || activeChannel.id;
      const res = await fetch(`/api/youtube/videos?channelId=${encodeURIComponent(channelId)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setErrorNotice(data.error || "Could not retrieve live channel videos.");
        // If channel has no live API tokens yet, keep empty without fake injection
        setVideos([]);
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to reach YouTube API endpoint.");
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchChannelVideos();
  }, [fetchChannelVideos]);

  const handleImportToProject = (vid: YouTubeVideoItem) => {
    const proj = addProject({
      name: vid.title,
      topic: vid.title,
      niche: activeChannel?.title || "YouTube Content",
      selectedTitle: vid.title,
      description: vid.description,
      status: "published",
    });
    router.push(`/dashboard/create?projectId=${proj.id}`);
  };

  const filteredVideos = videos.filter((v) =>
    (v.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Channel Videos
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                YouTube Data API v3
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active channel: <span className="text-slate-200 font-semibold">{activeChannel?.title || "No channel selected"}</span> ({activeChannel?.custom_url || "Link below"}).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={fetchChannelVideos}
              variant="outline"
              size="sm"
              isLoading={isLoading}
              className="text-xs border-navy-700 bg-navy-900/60"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync Videos
            </Button>
            <Link href="/dashboard/channels">
              <Button variant="gradient" size="sm" className="text-xs font-semibold shadow-glow">
                <Youtube className="w-3.5 h-3.5 mr-1.5" />
                Manage Channels
              </Button>
            </Link>
          </div>
        </div>

        {/* Channel Bar & Search */}
        <Card className="border-navy-800 bg-navy-900/90 p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by title or keyword..."
                className="text-xs pl-9 h-9"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-white">{filteredVideos.length}</span> videos listed
            </div>
          </div>
        </Card>

        {/* Notice for API Status */}
        {errorNotice && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <Link href="/dashboard/channels">
              <Button size="sm" variant="ghost" className="text-xs text-amber-300 hover:text-white shrink-0">
                Verify OAuth →
              </Button>
            </Link>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Card className="border-navy-800 bg-navy-900/40 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Film className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">No Videos Retrieved</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeChannel
                  ? "No published videos were returned for this channel via the YouTube Data API v3, or the channel has not completed Google OAuth consent."
                  : "Connect your real YouTube channel to view and manage your published videos."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Link href="/dashboard/create">
                <Button variant="gradient" size="sm" className="text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Create New Video
                </Button>
              </Link>
              <Link href="/dashboard/channels">
                <Button variant="outline" size="sm" className="text-xs border-navy-700">
                  <Youtube className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                  Channel Manager
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => {
              const pubDate = video.publishedAt || video.published_at;
              const formattedDate = pubDate
                ? format(new Date(pubDate), "MMM d, yyyy")
                : "Published";
              const thumb = video.thumbnail || video.thumbnail_url;
              const views = video.viewCount ?? video.views ?? 0;
              const likes = video.likeCount ?? video.likes ?? 0;
              const comments = video.commentCount ?? video.comments ?? 0;
              const privacy = video.privacyStatus || video.privacy_status || "public";
              const watchLink = video.video_url || `https://www.youtube.com/shorts/${video.id}`;

              return (
                <Card
                  key={video.id}
                  className="border-navy-800 bg-navy-900/80 hover:border-brand-purple/40 transition-all flex flex-col justify-between shadow-card overflow-hidden group"
                >
                  <div className="relative aspect-video w-full bg-navy-950 overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Play className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={privacy === "public" ? "success" : "secondary"} className="text-[10px] capitalize">
                        {privacy}
                      </Badge>
                    </div>
                    {video.duration_formatted && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                        {video.duration_formatted}
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {video.title}
                    </CardTitle>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-navy-800/80">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-brand-blue" />
                        {formatNumber(views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        {formatNumber(likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />
                        {formatNumber(comments)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-2 border-t border-navy-800/80 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => handleImportToProject(video)}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 hover:bg-navy-800"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-brand-purple" />
                      Import to Studio
                    </Button>

                    <a
                      href={watchLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white p-1"
                    >
                      <span className="text-[11px]">Watch Short</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

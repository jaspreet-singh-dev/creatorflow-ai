"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Video as VideoIcon,
  Calendar,
  Sparkles,
  UploadCloud,
  TrendingUp,
  Clock,
  Eye,
  Plus,
  ArrowUpRight,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Video, VideoStatus } from "@/types/database.types";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";

export default function DashboardOverviewPage() {
  const { profile, isDemoMode } = useAuth();
  const { channels, activeChannel } = useChannel();
  const { videos } = useData();

  // Filter videos for the active channel if one is selected
  const channelVideos = activeChannel
    ? videos.filter((v) => !v.channel_id || v.channel_id === activeChannel.id)
    : videos;

  const totalVideos = channelVideos.length;
  const publishedVideos = channelVideos.filter((v) => v.status === "published").length;
  const scheduledVideos = channelVideos.filter((v) => v.status === "scheduled").length;
  const draftVideos = channelVideos.filter((v) => v.status === "draft" || v.status === "ready").length;

  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "uploading":
      case "processing":
        return <Badge variant="blue">Uploading</Badge>;
      case "ready":
        return <Badge variant="outline">Ready</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Creator Studio Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, <span className="text-slate-200 font-medium">{profile?.full_name || "Creator"}</span>. Here is your channel performance and publishing workflow.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/metadata">
              <Button variant="gradient" size="sm" className="font-semibold text-xs shadow-glow">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate Metadata
              </Button>
            </Link>
            <Link href="/dashboard/uploads">
              <Button variant="outline" size="sm" className="text-xs border-navy-700 bg-navy-900/60">
                <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                New Upload
              </Button>
            </Link>
          </div>
        </div>

        {/* Creator 3-Step Quickstart: Easy & Complexity-Free Workflow */}
        <div className="p-4 sm:p-5 rounded-2xl border border-brand-purple/20 bg-navy-900/90 shadow-card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                Creator Quickstart: 3 Simple Steps
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The fastest way to take a video idea to an optimized, scheduled YouTube drop.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0 self-start sm:self-auto">
              Ready to Publish
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Step 1: Channel */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-500/20">
                1
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {activeChannel ? activeChannel.title : "Connect Channel"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {activeChannel ? `${formatNumber(activeChannel.subscriber_count)} subscribers` : "Enter handle (@you)"}
                </p>
                <Link
                  href="/dashboard/channels"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-purple font-semibold hover:underline mt-1.5"
                >
                  {activeChannel ? "Switch or Sync →" : "Link Channel →"}
                </Link>
              </div>
            </div>

            {/* Step 2: AI Metadata */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs shrink-0 border border-brand-purple/20">
                2
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">AI Titles & SEO Kit</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">Titles, description, tags & score</p>
                <Link
                  href="/dashboard/metadata"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-purple font-semibold hover:underline mt-1.5"
                >
                  Generate Metadata →
                </Link>
              </div>
            </div>

            {/* Step 3: Publish / Schedule */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0 border border-brand-blue/20">
                3
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Schedule & Drop</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">Calendar drop or direct upload</p>
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-blue font-semibold hover:underline mt-1.5"
                >
                  Open Calendar →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notice for Demo Mode */}
        {isDemoMode && (
          <div className="p-3.5 rounded-xl border border-brand-purple/30 bg-brand-purple/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-purple shrink-0" />
              <p className="text-xs text-slate-200">
                <strong className="text-white">Active Sandbox Mode:</strong> Connected to channels <code className="text-purple-300">@AIHorizons</code> and <code className="text-purple-300">@NexusCode</code>. You can test all workflows, AI generation, and scheduling safely.
              </p>
            </div>
            <Link href="/dashboard/settings">
              <Button size="sm" variant="ghost" className="text-xs text-brand-purple hover:text-white shrink-0">
                Configure Keys <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Top 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Channel Card */}
          <Card className="border-navy-800 bg-navy-900/90 relative overflow-hidden group hover:border-navy-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 rounded-full blur-xl pointer-events-none" />
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Channel
                </CardDescription>
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <Youtube className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-white truncate">
                {activeChannel ? activeChannel.title : "No Channel"}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">
                  {activeChannel ? `${formatNumber(activeChannel.subscriber_count)} subscribers` : "0 subs"}
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {channels.length} {channels.length === 1 ? "Channel" : "Channels"} Synced
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Videos Managed */}
          <Card className="border-navy-800 bg-navy-900/90 relative overflow-hidden group hover:border-navy-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-xl pointer-events-none" />
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Videos
                </CardDescription>
                <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center border border-brand-blue/20">
                  <VideoIcon className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-white">
                {totalVideos} <span className="text-xs font-normal text-slate-400">in workspace</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span>{publishedVideos} published</span>
                <span>•</span>
                <span>{draftVideos} drafts</span>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Queue */}
          <Card className="border-navy-800 bg-navy-900/90 relative overflow-hidden group hover:border-navy-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 rounded-full blur-xl pointer-events-none" />
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Scheduled Drops
                </CardDescription>
                <div className="w-7 h-7 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center border border-brand-purple/20">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-brand-purple">
                {scheduledVideos} <span className="text-xs font-normal text-slate-400">upcoming</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Next: In 2 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Views Managed */}
          <Card className="border-navy-800 bg-navy-900/90 relative overflow-hidden group hover:border-navy-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Channel Views
                </CardDescription>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-white">
                {activeChannel ? formatNumber(activeChannel.view_count) : "0"}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                <span>+12.8% vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/metadata"
              className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 hover:bg-navy-850 hover:border-brand-purple/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purple flex items-center justify-center border border-brand-purple/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">AI Metadata</p>
                <p className="text-[10px] text-slate-400 truncate">Generate titles & SEO</p>
              </div>
            </Link>

            <Link
              href="/dashboard/uploads"
              className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 hover:bg-navy-850 hover:border-brand-blue/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-blue/20 text-brand-blue flex items-center justify-center border border-brand-blue/30 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Upload Video</p>
                <p className="text-[10px] text-slate-400 truncate">YouTube Data API</p>
              </div>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 hover:bg-navy-850 hover:border-purple-400/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Schedule Drop</p>
                <p className="text-[10px] text-slate-400 truncate">Content Calendar</p>
              </div>
            </Link>

            <Link
              href="/dashboard/assistant"
              className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 hover:bg-navy-850 hover:border-emerald-400/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Brainstorm Ideas</p>
                <p className="text-[10px] text-slate-400 truncate">AI Content Engine</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Video Management & Publishing Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Workflow Table (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Video Publishing Workflow</h3>
                <p className="text-xs text-slate-400">
                  Manage drafts, scheduled releases, and published YouTube videos.
                </p>
              </div>
              <Link href="/dashboard/uploads">
                <Button variant="outline" size="sm" className="text-xs border-navy-700">
                  View All
                </Button>
              </Link>
            </div>

            <Card className="border-navy-800 bg-navy-900/70 overflow-hidden">
              <div className="divide-y divide-navy-800/80">
                {channelVideos.slice(0, 5).map((vid) => (
                  <div
                    key={vid.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-850/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Thumbnail Preview */}
                      <div className="w-20 h-12 rounded-lg bg-navy-800 shrink-0 overflow-hidden border border-navy-700 relative group">
                        {vid.thumbnail_url ? (
                          <img
                            src={vid.thumbnail_url}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <VideoIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Video Title & Meta */}
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-md">
                          {vid.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          {getStatusBadge(vid.status)}
                          <span className="capitalize">{vid.privacy_status}</span>
                          <span>•</span>
                          <span>
                            {vid.published_at
                              ? `Published ${format(new Date(vid.published_at), "MMM d, yyyy")}`
                              : vid.scheduled_at
                              ? `Scheduled ${format(new Date(vid.scheduled_at), "MMM d, HH:mm")}`
                              : `Updated ${format(new Date(vid.updated_at), "MMM d")}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link href={`/dashboard/metadata`}>
                        <Button variant="ghost" size="sm" className="text-xs h-8 text-brand-purple hover:text-white">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Metadata
                        </Button>
                      </Link>
                      {vid.youtube_video_id && (
                        <a
                          href={`https://youtube.com/watch?v=${vid.youtube_video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="icon" className="h-8 w-8 border-navy-700">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Channel Status & Quick Stats */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Channel Intelligence</h3>
            <Card className="border-navy-800 bg-navy-900/70 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-navy-800 border border-navy-700 shrink-0">
                  {activeChannel?.thumbnail_url ? (
                    <img
                      src={activeChannel.thumbnail_url}
                      alt={activeChannel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Youtube className="w-6 h-6 text-red-500 m-3" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{activeChannel?.title}</h4>
                  <p className="text-xs text-slate-400">{activeChannel?.custom_url || "@channel"}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-navy-800 text-xs">
                <div className="flex justify-between py-1 border-b border-navy-800/40">
                  <span className="text-slate-400">Total Subscribers</span>
                  <span className="text-white font-semibold">
                    {activeChannel ? formatNumber(activeChannel.subscriber_count) : "0"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/40">
                  <span className="text-slate-400">Total Videos on YouTube</span>
                  <span className="text-white font-semibold">
                    {activeChannel ? activeChannel.video_count : "0"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/40">
                  <span className="text-slate-400">Channel Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> OAuth Active
                  </span>
                </div>
              </div>

              <Link href="/dashboard/analytics" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs border-navy-700">
                  Open Channel Analytics
                </Button>
              </Link>
            </Card>

            {/* AI Optimization Tip Card */}
            <div className="p-4 rounded-xl border border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 space-y-2">
              <div className="flex items-center gap-2 text-brand-purple font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI Workflow Recommendation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Videos with structured chapter markers and curiosity-gap titles in the AI Metadata Studio see an average 24% higher average view duration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel, deduplicateChannels } from "@/context/channel-context";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Youtube,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Video,
  Eye,
  Users,
  Search,
  Key,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ConnectedChannel } from "@/types/database.types";
import Link from "next/link";

export default function ChannelManagerPage() {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    addChannelLocally,
    deleteChannel,
    syncChannelStats,
    refreshChannels,
  } = useChannel();
  const { isDemoMode, user } = useAuth();
  const { checkQuota } = useData();
  const { toast } = useToast();

  const uniqueChannels = React.useMemo(() => deduplicateChannels(channels), [channels]);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);
  const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);

  // Read URL search params upon returning from Google OAuth
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const channelName = params.get("channel");
    const errorParam = params.get("error");
    const linkedChannelStr = params.get("linked_channel");

    if (success === "true") {
      if (linkedChannelStr) {
        try {
          const parsed = JSON.parse(decodeURIComponent(linkedChannelStr));
          if (parsed && parsed.title) {
            addChannelLocally(parsed);
          }
        } catch (e) {
          console.warn("Could not parse linked channel payload", e);
        }
      }
      toast.success(
        "YouTube Channel Connected",
        `Successfully linked "${channelName || "channel"}" to your CreatorFlow workspace!`
      );
      refreshChannels();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      if (errorParam === "access_denied") {
        toast.error(
          "Google Access Denied (Error 403)",
          "Your Google account must be added to 'Test users' in Google Cloud Console > OAuth consent screen while the app is in Testing mode."
        );
      } else {
        toast.error("Channel Connection Failed", errorParam);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshChannels, toast, addChannelLocally]);

  // Real Channel Connect Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"lookup" | "oauth">("lookup");
  const [channelHandleInput, setChannelHandleInput] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [fetchedChannel, setFetchedChannel] = useState<any | null>(null);

  // Delete Channel Confirmation Modal
  const [channelToDelete, setChannelToDelete] = useState<ConnectedChannel | null>(null);

  const handleConnectGoogle = async () => {
    if (isDemoMode) {
      toast.info(
        "Sign In Recommended",
        "Sign in with your Creator account so your YouTube channel is saved permanently in your Supabase database."
      );
    }

    const quota = checkQuota("channel");
    if (!quota.allowed) {
      toast.error(
        "Channel Limit Reached",
        `You have connected ${quota.current} of ${quota.max} channels allowed on your plan. Upgrade to link more channels.`
      );
      return;
    }

    setIsConnecting(true);
    setConnectMessage(null);

    try {
      const stateParam = user?.id ? `?state=${encodeURIComponent(user.id)}` : "";
      const res = await fetch(`/api/youtube/auth-url${stateParam}`);
      const data = await res.json();

      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      setIsModalOpen(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLookupRealChannel = async () => {
    if (!channelHandleInput.trim()) {
      toast.error("Handle Required", "Please enter a YouTube channel handle (e.g. @mkbhd or @CreatorStudio).");
      return;
    }

    setIsLookingUp(true);
    setFetchedChannel(null);

    try {
      const res = await fetch("/api/youtube/channel-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handleOrUrl: channelHandleInput }),
      });
      const data = await res.json();

      if (data.success && data.channel) {
        setFetchedChannel(data.channel);
        toast.success("Real Channel Found", `Loaded YouTube channel info for ${data.channel.title}.`);
      } else {
        toast.error("Channel Lookup Failed", data.error || "Could not find channel.");
      }
    } catch (e: any) {
      toast.error("Error", e?.message || "Lookup service error.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSaveFetchedChannel = () => {
    if (!fetchedChannel) return;

    // Check if channel already exists in current channels list
    const existing = channels.find((c) => {
      if (
        c.youtube_channel_id &&
        fetchedChannel.youtube_channel_id &&
        c.youtube_channel_id.trim() === fetchedChannel.youtube_channel_id.trim()
      ) {
        return true;
      }
      if (
        c.custom_url &&
        fetchedChannel.custom_url &&
        c.custom_url.trim().toLowerCase() === fetchedChannel.custom_url.trim().toLowerCase()
      ) {
        return true;
      }
      if (
        c.title &&
        fetchedChannel.title &&
        c.title.trim().toLowerCase() === fetchedChannel.title.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    const newChannel: ConnectedChannel = {
      id: existing ? existing.id : `chan-${Date.now()}`,
      user_id: user?.id || "demo-user-123456",
      youtube_channel_id: fetchedChannel.youtube_channel_id,
      title: fetchedChannel.title,
      custom_url: fetchedChannel.custom_url,
      thumbnail_url: fetchedChannel.thumbnail_url,
      subscriber_count: fetchedChannel.subscriber_count,
      video_count: fetchedChannel.video_count,
      view_count: fetchedChannel.view_count,
      is_active: true,
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addChannelLocally(newChannel);
    setIsModalOpen(false);
    setChannelHandleInput("");
    setFetchedChannel(null);
    toast.success("Real Channel Connected", `Successfully linked "${newChannel.title}" to your CreatorFlow workspace.`);
  };

  const handleSyncStats = async (id: string, name: string) => {
    setSyncingChannelId(id);
    await syncChannelStats(id);
    setTimeout(() => {
      setSyncingChannelId(null);
      toast.success("Channel Synced", `Latest statistics refreshed for ${name}.`);
    }, 800);
  };

  const handleConfirmDelete = async () => {
    if (!channelToDelete) return;
    await deleteChannel(channelToDelete.id);
    toast.info("Channel Disconnected", `Disconnected ${channelToDelete.title}.`);
    setChannelToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Channel Manager
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                YouTube Data API v3
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect real YouTube channels, switch active workspaces, and sync analytics and uploads.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm" className="text-xs border-navy-700 bg-navy-900/60">
                <Key className="w-3.5 h-3.5 mr-1 text-slate-300" />
                API Keys
              </Button>
            </Link>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleConnectGoogle}
              isLoading={isConnecting}
              className="text-xs font-semibold shadow-glow"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Connect YouTube Channel
            </Button>
          </div>
        </div>

        {connectMessage && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{connectMessage}</span>
          </div>
        )}

        {/* Security & Token Isolation Banner */}
        <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Direct Channel Integration Engine</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                You can link any real YouTube channel via its handle, or configure live Google Cloud OAuth credentials in Settings for automated server-side video publishing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>YouTube Data API Ready</span>
          </div>
        </div>

        {/* Instant Channel Connect Bar */}
        <Card className="border-navy-800 bg-navy-900/90 p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                Quick Channel Connector
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Type any YouTube @handle to link live channel analytics, avatar, and subscribers instantly.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                value={channelHandleInput}
                onChange={(e) => setChannelHandleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setModalTab("lookup");
                    setIsModalOpen(true);
                    handleLookupRealChannel();
                  }
                }}
                placeholder="e.g. @mkbhd or @YourChannel"
                className="text-xs h-9 w-full sm:w-64"
              />
              <Button
                onClick={() => {
                  setModalTab("lookup");
                  setIsModalOpen(true);
                  handleLookupRealChannel();
                }}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold shrink-0"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Fetch & Link
              </Button>
            </div>
          </div>
        </Card>

        {/* Channels Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Connected YouTube Channels</h3>
            <span className="text-xs text-slate-400">{uniqueChannels.length} Channels Connected</span>
          </div>

          {uniqueChannels.length === 0 ? (
            <Card className="border-navy-800 bg-navy-900/40 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
                <Youtube className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-white">No YouTube Channels Connected Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your real YouTube channel by entering your channel @handle (e.g. @YourChannel), or link your Google Cloud OAuth credentials for direct publishing.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    setModalTab("lookup");
                    setIsModalOpen(true);
                  }}
                  variant="gradient"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Link Real Channel by Handle
                </Button>
                <Button
                  onClick={() => {
                    setModalTab("oauth");
                    setIsModalOpen(true);
                  }}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <Youtube className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                  Google Cloud OAuth
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {uniqueChannels.map((chan) => {
                const isActive = activeChannel?.id === chan.id;
                const isSyncing = syncingChannelId === chan.id;

                return (
                  <Card
                    key={chan.id}
                    className={`border transition-all shadow-card ${
                      isActive
                        ? "border-brand-purple bg-navy-900/90 shadow-glow"
                        : "border-navy-800 bg-navy-900/60 hover:border-navy-700"
                    }`}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-navy-800 border border-navy-700 shrink-0">
                            {chan.thumbnail_url ? (
                              <img
                                src={chan.thumbnail_url}
                                alt={chan.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Youtube className="w-6 h-6 text-red-500 m-3" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-bold text-white truncate">
                              {chan.title}
                            </CardTitle>
                            <p className="text-xs text-slate-400 truncate">{chan.custom_url || "@channel"}</p>
                          </div>
                        </div>

                        {isActive ? (
                          <Badge variant="default" className="text-[10px] font-bold">
                            Active Channel
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Connected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-2 space-y-3">
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-navy-950 border border-navy-800/80 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" /> Subs
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            {formatNumber(chan.subscriber_count)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" /> Views
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            {formatNumber(chan.view_count)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Video className="w-3 h-3" /> Videos
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">{chan.video_count}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Channel Active
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSyncStats(chan.id, chan.title)}
                            disabled={isSyncing}
                            className="hover:text-white flex items-center gap-1 text-[11px] text-slate-400"
                            title="Sync stats with YouTube"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-brand-purple" : ""}`} />
                            <span>Sync</span>
                          </button>
                          <a
                            href={`https://youtube.com/${chan.custom_url || ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-3 border-t border-navy-800/80 flex items-center justify-between">
                      {isActive ? (
                        <span className="text-xs text-brand-purple font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected in Workspace
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setActiveChannel(chan);
                            toast.success("Active Channel Switched", `Now operating under ${chan.title}.`);
                          }}
                          className="text-xs h-8 border-navy-700 bg-navy-800 hover:bg-navy-700"
                        >
                          Switch to this Channel
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setChannelToDelete(chan)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Disconnect Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Connect Real YouTube Channel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect YouTube Channel"
        description="Link any real YouTube channel by handle or connect with Google Cloud OAuth."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex border-b border-navy-800 gap-4 text-xs font-semibold">
            <button
              onClick={() => setModalTab("lookup")}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                modalTab === "lookup"
                  ? "border-brand-purple text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Link Any Real YouTube Channel</span>
            </button>
            <button
              onClick={() => setModalTab("oauth")}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                modalTab === "oauth"
                  ? "border-brand-purple text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>Google Cloud OAuth 2.0</span>
            </button>
          </div>

          {/* TAB 1: Real YouTube Channel Lookup */}
          {modalTab === "lookup" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                  Live YouTube Channel Search
                </p>
                <p className="text-[11px] text-slate-400">
                  Enter your real YouTube handle (e.g. <code>@novoice_craft</code>, <code>@mkbhd</code>, or your gaming channel). We will fetch its actual subscribers, avatar, and total views.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={channelHandleInput}
                  onChange={(e) => setChannelHandleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookupRealChannel()}
                  placeholder="Enter handle, e.g. @mkbhd or youtube.com/@YourChannel"
                  className="text-xs"
                />
                <Button
                  onClick={handleLookupRealChannel}
                  isLoading={isLookingUp}
                  variant="gradient"
                  className="text-xs font-semibold shrink-0"
                >
                  <Search className="w-3.5 h-3.5 mr-1" />
                  Fetch Channel
                </Button>
              </div>

              {/* Fetched Channel Preview Card */}
              {fetchedChannel && (
                <div className="p-4 rounded-xl border border-brand-purple/40 bg-navy-950/90 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <img
                      src={fetchedChannel.thumbnail_url}
                      alt={fetchedChannel.title}
                      className="w-14 h-14 rounded-full object-cover border-2 border-brand-purple"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{fetchedChannel.title}</span>
                        <Badge variant="blue" className="text-[9px] py-0 px-1">Verified</Badge>
                      </h4>
                      <p className="text-xs text-brand-purple font-mono">{fetchedChannel.custom_url}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Subscribers</span>
                      <p className="font-bold text-white mt-0.5">{formatNumber(fetchedChannel.subscriber_count)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Total Views</span>
                      <p className="font-bold text-white mt-0.5">{formatNumber(fetchedChannel.view_count)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Videos</span>
                      <p className="font-bold text-white mt-0.5">{fetchedChannel.video_count}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveFetchedChannel}
                    variant="gradient"
                    className="w-full text-xs font-bold shadow-glow"
                  >
                    Connect &quot;{fetchedChannel.title}&quot; to Workspace
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Google OAuth Configuration */}
          {modalTab === "oauth" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-white">Official Google OAuth Consent</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Connecting via Google OAuth requires a registered Google Cloud Client ID and Secret to authorize direct video file uploads to YouTube on your account&apos;s behalf.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 space-y-2">
                <p className="text-xs font-semibold text-white">To enable one-click Google Sign-in:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300">
                  <li>Go to Google Cloud Console &gt; Credentials</li>
                  <li>Create an OAuth 2.0 Client ID (Web Application)</li>
                  <li>Set Authorized Redirect URI to <code>http://localhost:3000/api/youtube/callback</code></li>
                  <li>Add your Client ID &amp; Secret in CreatorFlow Settings</li>
                  <li>
                    <strong className="text-amber-300">Fix &quot;Error 403: access_denied&quot;:</strong> While your app is in Google Testing mode, navigate to <strong>APIs &amp; Services &gt; OAuth consent screen &gt; Test users</strong>, click <strong>+ ADD USERS</strong> and add your Google email. Google blocks unapproved emails until added as Test Users.
                  </li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Link href="/dashboard/settings">
                  <Button variant="gradient" size="sm" className="text-xs font-semibold">
                    <Key className="w-3.5 h-3.5 mr-1" />
                    Configure OAuth Keys in Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Disconnect Channel Confirmation Modal */}
      <Modal
        isOpen={Boolean(channelToDelete)}
        onClose={() => setChannelToDelete(null)}
        title="Disconnect YouTube Channel?"
        description="Are you sure you want to disconnect this channel from your workspace?"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChannelToDelete(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="text-xs font-semibold"
            >
              Disconnect Channel
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-300 leading-relaxed">
          Disconnecting <strong>{channelToDelete?.title}</strong> will revoke the access token from this workspace session. Your uploaded videos on YouTube will not be modified or deleted.
        </p>
      </Modal>
    </DashboardLayout>
  );
}

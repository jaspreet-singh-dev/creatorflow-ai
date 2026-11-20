"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
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
  Check,
  Radio,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ConnectedChannel } from "@/types/database.types";

export default function ChannelManagerPage() {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    addChannelLocally,
    deleteChannel,
    syncChannelStats,
  } = useChannel();
  const { isDemoMode } = useAuth();
  const { checkQuota } = useData();
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);
  const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);

  // Manual / Custom Channel Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [customSubs, setCustomSubs] = useState("25000");

  // Delete Channel Confirmation Modal
  const [channelToDelete, setChannelToDelete] = useState<ConnectedChannel | null>(null);

  const handleConnectGoogle = async () => {
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
      const res = await fetch("/api/youtube/auth-url");
      const data = await res.json();

      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        // Open manual connect modal
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      setIsModalOpen(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateCustomChannel = () => {
    if (!customTitle.trim()) {
      toast.error("Channel Title Required", "Please provide a title for the YouTube channel.");
      return;
    }

    const newChannel: ConnectedChannel = {
      id: `chan-${Date.now()}`,
      user_id: "demo-user-123456",
      youtube_channel_id: `UC_custom_${Date.now()}`,
      title: customTitle,
      custom_url: customHandle.startsWith("@") ? customHandle : `@${customHandle || customTitle.replace(/\s+/g, "")}`,
      thumbnail_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      subscriber_count: parseInt(customSubs, 10) || 12000,
      video_count: 24,
      view_count: (parseInt(customSubs, 10) || 12000) * 45,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addChannelLocally(newChannel);
    setIsModalOpen(false);
    setCustomTitle("");
    setCustomHandle("");
    toast.success("Channel Connected", `Connected "${newChannel.title}" to your CreatorFlow workspace.`);
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
                Google OAuth 2.0
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect and manage multiple YouTube channels. Securely author uploads, switch workspaces, and sync analytics.
            </p>
          </div>

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
              <h4 className="text-xs font-bold text-white">Encrypted OAuth Token Vault</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Tokens are stored securely in PostgreSQL with Row Level Security. Secrets are never exposed to browser client sessions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>YouTube Data API v3 Active</span>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Connected YouTube Channels</h3>
            <span className="text-xs text-slate-400">{channels.length} Channels Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {channels.map((chan) => {
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
                        <CheckCircle2 className="w-3 h-3" /> OAuth Token Valid
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
        </div>
      </div>

      {/* Manual / Sandbox Channel Connection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect YouTube Channel"
        description="Link your YouTube Channel via Google OAuth or configure a workspace channel."
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCreateCustomChannel}
              className="text-xs font-semibold"
            >
              Link Channel
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              OAuth Sandbox Connection
            </p>
            <p>
              When live Google OAuth keys are set in <code>.env.local</code>, this launches Google consent directly. In sandbox mode, you can connect and test any channel profile.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Channel Title <span className="text-brand-purple">*</span>
            </label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. CodeCraft Studios"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Channel Handle</label>
            <Input
              value={customHandle}
              onChange={(e) => setCustomHandle(e.target.value)}
              placeholder="e.g. @CodeCraft"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Initial Subscribers</label>
            <Input
              type="number"
              value={customSubs}
              onChange={(e) => setCustomSubs(e.target.value)}
              className="text-xs"
            />
          </div>
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

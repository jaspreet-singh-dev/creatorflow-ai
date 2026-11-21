"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FolderPlus,
  Clock,
  ArrowRight,
  Hash,
  ShieldCheck,
  Youtube,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function DescriptionStudioPage() {
  const { activeChannel } = useChannel();
  const { addProject, checkQuota } = useData();
  const { toast } = useToast();

  const [title, setTitle] = useState("CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft");
  const [topic, setTopic] = useState("Can Sweet Berries Save You From Lethal Fall Damage in Minecraft?");
  const [niche, setNiche] = useState("Minecraft & Gaming");
  const [targetAudience, setTargetAudience] = useState("Minecraft players and YouTube Shorts viewers");
  const [timestampsInput, setTimestampsInput] = useState(
    "00:00 - The Impossible Drop\n00:05 - Sweet Berries vs Fall Damage\n00:11 - Slow Motion Hitbox Test\n00:16 - Survives or Dies?"
  );
  const [customLinks, setCustomLinks] = useState("👉 Subscribe to NoVoiceCraft: https://youtube.com/@novoice_craft\n🎮 Share with a friend who fails their clutches!");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [generatedDescription, setGeneratedDescription] = useState(
    `CAN SWEET BERRIES SAVE ME FROM MAXIMUM BUILD LIMIT?! 💀🌿\n\nDropping from Y=320 all the way down with zero armor and testing if a single sweet berry bush can break lethal fall damage! Watch until the end to see the final heart count!\n\nTIMESTAMPS:\n00:00 - The Impossible Drop\n00:05 - Sweet Berries vs Fall Damage\n00:11 - Slow Motion Hitbox Test\n00:16 - Survives or Dies?\n\n🎮 Channel: @novoice_craft\n🔔 Subscribe for daily insane Minecraft clutch challenges!\n\n#minecraft #shorts #minecraftmemes #clutch #gaming #minecraftclutch #survival\n\nDISCLAIMER: Content optimization and SEO metadata improve organic search discoverability and viewer relevance. Platform distribution depends on real viewer retention, satisfaction, and engagement.`
  );

  const handleGenerate = async () => {
    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error("AI Quota Exceeded", "You have reached your monthly AI generations limit.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "description",
          topic,
          selectedTitle: title,
          niche,
          targetAudience,
          currentScript: timestampsInput,
          channelContext: {
            channelTitle: activeChannel?.title,
            niche,
            subscriberCount: activeChannel?.subscriber_count,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        let desc = typeof json.data === "string" ? json.data : json.data.description || "";
        if (customLinks.trim() && !desc.includes(customLinks.trim())) {
          desc += `\n\nLINKS:\n${customLinks.trim()}`;
        }
        setGeneratedDescription(desc);
        toast.success("Description Generated", "Ready for your YouTube upload.");
      } else {
        toast.error("Generation Issue", json.error || "Could not generate description.");
      }
    } catch (e: any) {
      toast.error("Connection Error", e.message || "Failed to reach AI server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    toast.success("Copied", "Description copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToProject = () => {
    const proj = addProject({
      name: title || "New Description Project",
      topic,
      niche,
      selectedTitle: title,
      description: generatedDescription,
      status: "draft",
    });
    toast.success("Saved to Projects", `Created project "${proj.name}".`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Description Studio
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                AI Copywriter
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Craft high-retention, SEO-optimized YouTube descriptions with structured chapter timestamps and natural keyword integration.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="text-xs border-navy-700 bg-navy-900/60"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? "Copied" : "Copy Description"}
            </Button>
            <Button
              onClick={handleSaveToProject}
              variant="gradient"
              size="sm"
              className="text-xs font-semibold shadow-glow"
            >
              <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
              Save to Projects
            </Button>
          </div>
        </div>

        {/* Studio Workspace 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration & Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 p-5 space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-purple" />
                  Video Parameters
                </h3>
                <span className="text-[10px] text-slate-400">Context Engine</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Selected Video Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Core Topic & Angle</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Can Sweet Berries Save You From Lethal Fall Damage?"
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Channel Niche</label>
                    <Input
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g. Minecraft & Gaming"
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Target Audience</label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Minecraft players & Shorts viewers"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Timestamps / Chapters (Optional)</label>
                  <Textarea
                    value={timestampsInput}
                    onChange={(e) => setTimestampsInput(e.target.value)}
                    rows={4}
                    placeholder="00:00 - Introduction&#10;02:15 - Core Concept"
                    className="text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Only include timestamps supported by actual video sections.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">User Links / Calls to Action</label>
                  <Input
                    value={customLinks}
                    onChange={(e) => setCustomLinks(e.target.value)}
                    placeholder="👉 https://yourlink.com"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                isLoading={isLoading}
                variant="gradient"
                className="w-full text-xs font-semibold shadow-glow"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate AI Description
              </Button>
            </Card>
          </div>

          {/* Right Column: Interactive Output Editor */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-navy-800 bg-navy-900/90 p-5 space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Full Description Preview
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {generatedDescription.length} chars
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <Textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={18}
                className="text-xs font-mono leading-relaxed bg-navy-950 p-4 border-navy-800"
              />

              <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  YouTube SEO guidelines compliant
                </span>
                <Link href="/dashboard/metadata" className="text-brand-purple hover:underline text-[11px] font-semibold">
                  Configure Tags & SEO Studio →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

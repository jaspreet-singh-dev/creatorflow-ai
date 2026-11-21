"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useData } from "@/context/data-context";
import { useChannel } from "@/context/channel-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  UploadCloud,
  FileText,
  Calendar,
  CheckCircle2,
  Film,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoProject, VideoStatus, ProjectStatus } from "@/types/database.types";
import { format } from "date-fns";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, deleteProject, addProject } = useData();
  const { activeChannel } = useChannel();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.niche || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    const newProj = addProject({
      name: "New Creator Studio Project",
      topic: "Untitled Strategy",
      niche: activeChannel?.title ? "Minecraft & Gaming" : "Gaming",
      status: "draft",
    });
    router.push(`/dashboard/create?projectId=${newProj.id}`);
  };

  const getStatusBadge = (status: VideoStatus | ProjectStatus | string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "ready":
        return <Badge variant="blue">Ready</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Projects
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                {filteredProjects.length} Projects
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Central workspace for all your scripted, metadata-optimized, and published YouTube video projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/create">
              <Button variant="gradient" size="sm" className="text-xs font-semibold shadow-glow">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Open AI Studio
              </Button>
            </Link>
            <Button
              onClick={handleCreateNew}
              variant="outline"
              size="sm"
              className="text-xs border-navy-700 bg-navy-900/60"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
              New Project
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="border-navy-800 bg-navy-900/90 p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by topic, title, or niche..."
                className="text-xs pl-9 h-9"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "draft", "ready", "scheduled", "published"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                    filterStatus === st
                      ? "bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-bold"
                      : "text-slate-400 hover:text-white bg-navy-950/60 border border-navy-800/80"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-navy-800 bg-navy-900/40 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto border border-brand-purple/20">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">No Projects Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchQuery || filterStatus !== "all"
                  ? "No projects match your current search and filter criteria. Clear filters or create a new project."
                  : "Start creating your first video with the AI-powered Creator Studio."}
              </p>
            </div>
            <Button onClick={handleCreateNew} variant="gradient" size="sm" className="text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => {
              const formattedDate = proj.updatedAt
                ? format(new Date(proj.updatedAt), "MMM d, yyyy")
                : "Recent";

              return (
                <Card
                  key={proj.id}
                  className="border-navy-800 bg-navy-900/80 hover:border-brand-purple/40 transition-all flex flex-col justify-between shadow-card group"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getStatusBadge(proj.status)}
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {proj.selectedTitle || proj.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 line-clamp-1 mt-1">
                      Topic: {proj.topic || "General Concept"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] bg-navy-950">
                        {proj.niche || "Minecraft & Gaming"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-navy-950 capitalize">
                        {proj.contentType || "Tutorial"}
                      </Badge>
                      {proj.tags && proj.tags.length > 0 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{proj.tags.length} tags
                        </span>
                      )}
                    </div>

                    {proj.hook && (
                      <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800/80 text-slate-300">
                        <span className="text-[9px] uppercase font-bold text-brand-purple block mb-0.5">
                          Opening Hook:
                        </span>
                        <p className="line-clamp-2 text-[11px]">&quot;{proj.hook}&quot;</p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-3 border-t border-navy-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/create?projectId=${proj.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 border-navy-700 hover:bg-navy-800">
                          <Edit3 className="w-3 h-3 mr-1 text-brand-purple" />
                          Edit Studio
                        </Button>
                      </Link>
                      <Link href={`/dashboard/publish?projectId=${proj.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-brand-blue hover:text-white">
                          <UploadCloud className="w-3 h-3 mr-1" />
                          Publish Hub
                        </Button>
                      </Link>
                    </div>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-navy-800 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

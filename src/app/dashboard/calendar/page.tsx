"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Youtube,
  CheckCircle2,
  CalendarCheck,
  Video as VideoIcon,
  Filter,
  List,
  Grid,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Video, VideoPrivacy, VideoStatus } from "@/types/database.types";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import Link from "next/link";

export default function ContentCalendarPage() {
  const { channels, activeChannel } = useChannel();
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 10, 1)); // Nov 2026
  const [selectedChannelId, setSelectedChannelId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  // Selected Video Inspector
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [inspectorScheduledAt, setInspectorScheduledAt] = useState("");
  const [inspectorPrivacy, setInspectorPrivacy] = useState<VideoPrivacy>("public");

  // Create Drop for Specific Day Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dropTitle, setDropTitle] = useState("");
  const [dropDescription, setDropDescription] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [dropChannelId, setDropChannelId] = useState("");
  const [dropPrivacy, setDropPrivacy] = useState<VideoPrivacy>("public");

  // Month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Date matrix calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Filtering
  const filteredVideos = videos.filter((v) => {
    if (selectedChannelId !== "all" && v.channel_id !== selectedChannelId) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const handleOpenDaySchedule = (day: Date) => {
    const defaultTime = new Date(day);
    defaultTime.setHours(17, 0, 0, 0); // 5:00 PM default drop time
    setDropDate(format(defaultTime, "yyyy-MM-dd'T'HH:mm"));
    setDropTitle("");
    setDropDescription("");
    setDropChannelId(activeChannel?.id || "chan-demo-1");
    setDropPrivacy("public");
    setIsCreateModalOpen(true);
  };

  const handleSaveNewDrop = () => {
    if (!dropTitle.trim()) {
      toast.error("Title Required", "Please enter a title for the video release.");
      return;
    }

    const scheduledDate = dropDate ? new Date(dropDate).toISOString() : new Date().toISOString();
    const newVideo = addVideo({
      title: dropTitle,
      description: dropDescription,
      channel_id: dropChannelId || activeChannel?.id || "chan-demo-1",
      privacy_status: dropPrivacy,
      status: "scheduled",
      scheduled_at: scheduledDate,
    });

    setIsCreateModalOpen(false);
    toast.success("Release Scheduled", `Scheduled "${newVideo.title.substring(0, 35)}..." on ${format(new Date(scheduledDate), "MMM d, yyyy")}.`);
  };

  const handleOpenInspector = (v: Video) => {
    setSelectedVideo(v);
    setInspectorScheduledAt(v.scheduled_at ? v.scheduled_at.substring(0, 16) : "");
    setInspectorPrivacy(v.privacy_status);
  };

  const handleUpdateScheduledDate = () => {
    if (!selectedVideo) return;
    updateVideo(selectedVideo.id, {
      scheduled_at: inspectorScheduledAt ? new Date(inspectorScheduledAt).toISOString() : null,
      privacy_status: inspectorPrivacy,
    });
    setSelectedVideo(null);
    toast.success("Schedule Updated", "Video release timing updated.");
  };

  const handleDeleteVideo = (id: string) => {
    deleteVideo(id);
    setSelectedVideo(null);
  };

  // Agenda list (all videos with scheduled or published dates)
  const agendaVideos = [...filteredVideos]
    .filter((v) => v.scheduled_at || v.published_at)
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_at || a.published_at || 0).getTime();
      const dateB = new Date(b.scheduled_at || b.published_at || 0).getTime();
      return dateA - dateB;
    });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Content Calendar & Releases
              </h1>
              <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider">
                Release Pipeline
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Coordinate multi-channel publishing, schedule release dates, and track confirmed YouTube uploads.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="p-0.5 rounded-lg border border-navy-700 bg-navy-900/60 flex items-center">
              <button
                onClick={() => setViewMode("month")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "month" ? "bg-navy-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "agenda" ? "bg-navy-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            <Button
              variant="gradient"
              size="sm"
              onClick={() => handleOpenDaySchedule(new Date())}
              className="text-xs font-semibold shadow-glow"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Schedule Video Drop
            </Button>
          </div>
        </div>

        {/* Filters and Month Switcher */}
        <Card className="border-navy-800 bg-navy-900/90 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  className="h-8 w-8 border-navy-700 bg-navy-950"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-8 w-8 border-navy-700 bg-navy-950"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Channel:</span>
              </div>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="h-8 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
              >
                <option value="all">All Channels</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled Only</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">YouTube Confirmed Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
            <span className="text-slate-300">Local Planned Schedule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
            <span className="text-slate-300">Published Video</span>
          </div>
        </div>

        {/* =========================================================================
            MONTH VIEW
        ========================================================================= */}
        {viewMode === "month" && (
          <Card className="border-navy-800 bg-navy-900/90 shadow-card overflow-hidden">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-navy-800 bg-navy-950 text-center text-xs font-semibold text-slate-400 py-2.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-navy-800">
              {days.map((day, idx) => {
                const isCurrent = isSameMonth(day, currentMonth);
                const dayVideos = filteredVideos.filter((v) => {
                  if (v.published_at && isSameDay(new Date(v.published_at), day)) return true;
                  if (v.scheduled_at && isSameDay(new Date(v.scheduled_at), day)) return true;
                  return false;
                });

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-2 flex flex-col justify-between transition-colors relative group/cell ${
                      isCurrent ? "bg-navy-900/60" : "bg-navy-950/40 opacity-40"
                    } hover:bg-navy-850/60`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSameDay(day, new Date(2026, 10, 20))
                            ? "w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center"
                            : "text-slate-400"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Add button visible on hover */}
                      <button
                        onClick={() => handleOpenDaySchedule(day)}
                        className="opacity-0 group-hover/cell:opacity-100 p-1 rounded hover:bg-navy-800 text-slate-400 hover:text-white transition-opacity text-[10px]"
                        title="Schedule drop on this date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scheduled Items in this Day */}
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-24">
                      {dayVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleOpenInspector(video)}
                          className={`p-1.5 rounded text-[11px] font-medium truncate cursor-pointer transition-colors border ${
                            video.status === "published"
                              ? "bg-brand-blue/15 text-blue-300 border-brand-blue/30 hover:bg-brand-blue/25"
                              : video.youtube_video_id
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-brand-purple/15 text-purple-300 border-brand-purple/30 hover:bg-brand-purple/25"
                          }`}
                        >
                          <p className="truncate leading-tight font-semibold flex items-center gap-1">
                            {video.youtube_video_id && <Youtube className="w-3 h-3 text-red-500 shrink-0" />}
                            <span>{video.title}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* =========================================================================
            AGENDA (LIST) VIEW
        ========================================================================= */}
        {viewMode === "agenda" && (
          <Card className="border-navy-800 bg-navy-900/90 shadow-card divide-y divide-navy-800 overflow-hidden">
            {agendaVideos.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No scheduled video releases found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click &quot;Schedule Video Drop&quot; above to plan an upcoming release.
                </p>
              </div>
            ) : (
              agendaVideos.map((v) => {
                const targetDate = v.scheduled_at || v.published_at || "";
                return (
                  <div
                    key={v.id}
                    onClick={() => handleOpenInspector(v)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-850/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-lg bg-navy-950 border border-navy-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-brand-purple">
                          {format(new Date(targetDate), "MMM")}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {format(new Date(targetDate), "d")}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{v.title}</span>
                          {v.youtube_video_id && (
                            <Badge variant="success" className="text-[9px] py-0 px-1.5 h-4">
                              YouTube Confirmed
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {v.description || "No description"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {format(new Date(targetDate), "EEEE, MMMM d, yyyy 'at' h:mm a")} • {v.privacy_status.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          v.status === "published"
                            ? "success"
                            : v.status === "scheduled"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {v.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        )}
      </div>

      {/* Video Inspector Modal */}
      <Modal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        title="Video Release Inspector"
        description="Inspect release parameters, reschedule drop time, or edit metadata."
        maxWidth="lg"
        footer={
          selectedVideo && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteVideo(selectedVideo.id)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleUpdateScheduledDate}
                  className="text-xs font-semibold"
                >
                  Save Schedule
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedVideo && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">{selectedVideo.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedVideo.description || "No description provided."}
              </p>
            </div>

            <div className="space-y-3 p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Release Status:</span>
                <Badge variant={selectedVideo.status === "published" ? "success" : "default"}>
                  {selectedVideo.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">YouTube Backend:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  {selectedVideo.youtube_video_id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmed Scheduled on YouTube
                    </>
                  ) : (
                    "Local Planned Schedule"
                  )}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-navy-800">
                <label className="text-xs font-semibold text-slate-300">Reschedule Release Date & Time</label>
                <Input
                  type="datetime-local"
                  value={inspectorScheduledAt}
                  onChange={(e) => setInspectorScheduledAt(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Privacy Status</label>
                <select
                  value={inspectorPrivacy}
                  onChange={(e) => setInspectorPrivacy(e.target.value as VideoPrivacy)}
                  className="w-full h-8 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <Link
                href={`/dashboard/metadata`}
                className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open in AI Metadata Studio
              </Link>
              <Link
                href={`/dashboard/uploads`}
                className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-semibold"
              >
                <VideoIcon className="w-3.5 h-3.5" />
                Open in Video Manager
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Video Drop on Date Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Video Drop"
        description="Plan a video release on your content calendar."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSaveNewDrop}
              className="text-xs font-semibold"
            >
              Add to Calendar
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Video Title <span className="text-brand-purple">*</span>
            </label>
            <Input
              value={dropTitle}
              onChange={(e) => setDropTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Full Tutorial & Roadmap"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Rough Description / Notes</label>
            <Textarea
              rows={3}
              value={dropDescription}
              onChange={(e) => setDropDescription(e.target.value)}
              placeholder="Key talking points or outline notes..."
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Scheduled Date & Time</label>
              <Input
                type="datetime-local"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Channel</label>
              <select
                value={dropChannelId}
                onChange={(e) => setDropChannelId(e.target.value)}
                className="w-full h-9 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
              >
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Privacy Status</label>
            <select
              value={dropPrivacy}
              onChange={(e) => setDropPrivacy(e.target.value as VideoPrivacy)}
              className="w-full h-9 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

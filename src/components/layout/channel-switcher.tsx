"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChannel } from "@/context/channel-context";
import { ChevronDown, Youtube, Check, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

export function ChannelSwitcher() {
  const { channels, activeChannel, setActiveChannel } = useChannel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-navy-800 bg-navy-900/80 hover:bg-navy-850 hover:border-navy-700 transition-all text-left text-sm"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0">
          {activeChannel?.thumbnail_url ? (
            <img
              src={activeChannel.thumbnail_url}
              alt={activeChannel.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Youtube className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-xs text-white truncate max-w-[130px] sm:max-w-[160px]">
            {activeChannel ? activeChannel.title : "No Channel Connected"}
          </span>
          {activeChannel && (
            <span className="text-[10px] text-slate-400">
              {formatNumber(activeChannel.subscriber_count)} subscribers
            </span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl border border-navy-800 bg-navy-900 shadow-xl backdrop-blur-md z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-navy-800">
            Connected Channels
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannel(ch);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-navy-800/80 ${
                  activeChannel?.id === ch.id ? "bg-navy-800/50 text-white" : "text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-navy-800 shrink-0 border border-navy-700">
                    {ch.thumbnail_url ? (
                      <img src={ch.thumbnail_url} alt={ch.title} className="w-full h-full object-cover" />
                    ) : (
                      <Youtube className="w-3 h-3 text-red-500 m-1.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate">{ch.title}</p>
                    <p className="text-[10px] text-slate-400">{formatNumber(ch.subscriber_count)} subs</p>
                  </div>
                </div>
                {activeChannel?.id === ch.id && (
                  <Check className="w-4 h-4 text-brand-purple shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-navy-800 pt-1 mt-1 px-1.5">
            <Link
              href="/dashboard/channels"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-brand-purple hover:bg-navy-800 transition-colors w-full"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect New Channel</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

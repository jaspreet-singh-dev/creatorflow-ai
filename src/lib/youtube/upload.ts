import { google } from "googleapis";
import { getOAuth2Client } from "./oauth";
import { VideoPrivacy } from "@/types/database.types";

export interface InitiateUploadParams {
  title: string;
  description: string;
  tags: string[];
  privacyStatus: VideoPrivacy;
  publishAt?: string; // ISO string for YouTube official scheduling
  accessToken?: string;
  refreshToken?: string;
}

export async function initiateYouTubeResumableUpload(params: InitiateUploadParams) {
  const oauth2Client = getOAuth2Client();

  if (params.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: params.refreshToken,
      access_token: params.accessToken,
    });
  }

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // YouTube official scheduling requires privacyStatus = 'private' and publishAt defined
  const statusPayload: any = {
    privacyStatus: params.publishAt ? "private" : params.privacyStatus,
    selfDeclaredMadeForKids: false,
  };

  if (params.publishAt) {
    statusPayload.publishAt = params.publishAt;
  }

  // Request upload URL
  return {
    ready: true,
    scheduledOnYouTube: Boolean(params.publishAt),
    status: "ready",
    snippet: {
      title: params.title,
      description: params.description,
      tags: params.tags,
    },
    statusPayload,
  };
}

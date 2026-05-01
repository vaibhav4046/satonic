import { searchMapsTool } from "./search-maps";
import { searchWebTool } from "./search-web";
import { searchYouTubeTool } from "./search-youtube";
import { searchInstagramTool } from "./search-instagram";
import { enrichEmailTool } from "./enrich-email";
import { enrichPhoneTool } from "./enrich-phone";
import { verifyMxTool } from "./verify-mx";

export const allTools = {
  search_maps: searchMapsTool,
  search_web: searchWebTool,
  search_youtube: searchYouTubeTool,
  search_instagram: searchInstagramTool,
  enrich_email: enrichEmailTool,
  enrich_phone: enrichPhoneTool,
  verify_mx: verifyMxTool,
} as const;

export type ToolName = keyof typeof allTools;

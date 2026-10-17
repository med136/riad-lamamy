export type ChannelProvider = "airbnb" | "booking" | "expedia" | "vrbo" | "tripadvisor" | "custom";
export type ChannelConnectionType = "import" | "export" | "bidirectional";
export type ChannelHealth = "not_configured" | "healthy" | "degraded" | "failing" | "disabled";
export type SyncRunStatus = "running" | "succeeded" | "partial" | "failed" | "skipped";
export type ConflictStatus = "open" | "resolved" | "dismissed";

export type BookingChannelRow = {
  id: string;
  name: string;
  provider: ChannelProvider;
  connection_type: ChannelConnectionType;
  enabled: boolean;
  import_url_encrypted: string | null;
  import_url_host: string | null;
  sync_interval_minutes: number;
  health: ChannelHealth;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChannelRoomMappingRow = {
  id: string;
  channel_id: string;
  room_id: number;
  enabled: boolean;
  external_room_id: string | null;
  export_token_hash: string | null;
  export_token_hint: string | null;
  stale_observation_count: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChannelAdminDto = Omit<BookingChannelRow, "import_url_encrypted" | "import_url_host"> & {
  hasImportUrl: boolean;
  importHost: string | null;
};

export type MappingAdminDto = Omit<ChannelRoomMappingRow, "export_token_hash" | "export_token_hint"> & {
  hasExportToken: boolean;
  exportTokenHint: string | null;
};

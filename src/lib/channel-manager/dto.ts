import type {
  BookingChannelRow,
  ChannelAdminDto,
  ChannelRoomMappingRow,
  MappingAdminDto,
} from "./types.ts";

export function toChannelAdminDto(row: BookingChannelRow): ChannelAdminDto {
  const { import_url_encrypted, import_url_host, ...safe } = row;
  return {
    ...safe,
    hasImportUrl: Boolean(import_url_encrypted),
    importHost: import_url_host,
  };
}

export function toMappingAdminDto(row: ChannelRoomMappingRow): MappingAdminDto {
  const { export_token_hash, export_token_hint, ...safe } = row;
  return {
    ...safe,
    hasExportToken: Boolean(export_token_hash),
    exportTokenHint: export_token_hint,
  };
}

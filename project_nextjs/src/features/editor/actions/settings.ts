"use server";

import { getCurrentUser } from "@/lib/permissions";
import {
  loadSectionSettings,
  saveSectionSettings,
  loadSetting,
  saveSetting,
} from "@/lib/settings-helpers";
import { revalidatePath } from "next/cache";

export type SaveSettingsResult = {
  success: boolean;
  message: string;
  error?: string;
};

type SettingsRecord = Record<string, unknown>;

/**
 * Load settings for a specific section
 */
export async function loadSettings(
  section: string,
  journalId?: string
): Promise<{ success: boolean; settings?: SettingsRecord; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get journal ID from parameter or user roles
    let currentJournalId = journalId;
    if (!currentJournalId) {
      const journalRole = user.roles.find((r) => r.context_id);
      if (!journalRole?.context_id) {
        return {
          success: false,
          error: "Journal ID not found",
        };
      }
      currentJournalId = journalRole.context_id;
    }

    // Check permissions
    const hasPermission = user.roles.some(
      (role) =>
        role.role_path === "admin" ||
        role.role_path === "manager" ||
        role.role_path === "editor" ||
        (role.context_id === currentJournalId &&
          ["manager", "editor", "section_editor"].includes(role.role_path))
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    const settings = await loadSectionSettings(currentJournalId, section);
    return {
      success: true,
      settings,
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load settings",
    };
  }
}

/**
 * Save settings for a specific section
 */
export async function saveSettings(
  section: string,
  settings: SettingsRecord,
  journalId?: string
): Promise<SaveSettingsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to save settings",
      };
    }

    // Get journal ID from parameter or user roles
    let currentJournalId = journalId;
    if (!currentJournalId) {
      const journalRole = user.roles.find((r) => r.context_id);
      if (!journalRole?.context_id) {
        return {
          success: false,
          message: "Journal ID not found",
          error: "Journal ID is required",
        };
      }
      currentJournalId = journalRole.context_id;
    }

    // Check permissions
    const hasPermission = user.roles.some(
      (role) =>
        role.role_path === "admin" ||
        role.role_path === "manager" ||
        role.role_path === "editor" ||
        (role.context_id === currentJournalId &&
          ["manager", "editor", "section_editor"].includes(role.role_path))
    );

    if (!hasPermission) {
      return {
        success: false,
        message: "Forbidden",
        error: "You don't have permission to save settings",
      };
    }

    // Transform settings to the format expected by saveSectionSettings
    const settingsToSave: Record<string, { value: unknown; type?: "string" | "bool" | "int" | "float" | "object" }> = {};
    for (const [key, value] of Object.entries(settings)) {
      // Auto-detect type
      let type: "string" | "bool" | "int" | "float" | "object" = "string";
      if (typeof value === "boolean") {
        type = "bool";
      } else if (typeof value === "number") {
        type = Number.isInteger(value) ? "int" : "float";
      } else if (typeof value === "object" && value !== null) {
        type = "object";
      }
      settingsToSave[key] = { value, type };
    }

    await saveSectionSettings(currentJournalId, section, settingsToSave);

    // Revalidate the settings page
    revalidatePath(`/editor/settings/${section}`);

    return {
      success: true,
      message: "Settings saved successfully",
    };
  } catch (error) {
    console.error("Error saving settings:", error);
    return {
      success: false,
      message: "Failed to save settings",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Load a single setting value
 */
export async function loadSettingValue(
  settingName: string,
  defaultValue: unknown = null,
  journalId?: string
): Promise<{ success: boolean; value?: unknown; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get journal ID from parameter or user roles
    let currentJournalId = journalId;
    if (!currentJournalId) {
      const journalRole = user.roles.find((r) => r.context_id);
      if (!journalRole?.context_id) {
        return {
          success: false,
          error: "Journal ID not found",
        };
      }
      currentJournalId = journalRole.context_id;
    }

    const value = await loadSetting(currentJournalId, settingName, defaultValue);
    return {
      success: true,
      value,
    };
  } catch (error) {
    console.error("Error loading setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load setting",
    };
  }
}

/**
 * Save a single setting value
 */
export async function saveSettingValue(
  settingName: string,
  value: unknown,
  settingType: "string" | "bool" | "int" | "float" | "object" = "string",
  journalId?: string
): Promise<SaveSettingsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to save settings",
      };
    }

    // Get journal ID from parameter or user roles
    let currentJournalId = journalId;
    if (!currentJournalId) {
      const journalRole = user.roles.find((r) => r.context_id);
      if (!journalRole?.context_id) {
        return {
          success: false,
          message: "Journal ID not found",
          error: "Journal ID is required",
        };
      }
      currentJournalId = journalRole.context_id;
    }

    await saveSetting(currentJournalId, settingName, value, settingType);

    return {
      success: true,
      message: "Setting saved successfully",
    };
  } catch (error) {
    console.error("Error saving setting:", error);
    return {
      success: false,
      message: "Failed to save setting",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}








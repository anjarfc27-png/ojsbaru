export type HostedJournal = {
  id: string;
  name: string;
  path: string;
  isPublic: boolean;
  description?: string;
};

export type JournalSettings = {
  context: {
    name: string;
    initials: string;
    abbreviation: string;
    publisher: string;
    issnOnline: string;
    issnPrint: string;
    focusScope: string;
  };
  search: {
    keywords: string;
    description: string;
    includeSupplemental: boolean;
  };
  theme: {
    theme: string;
    headerBg: string;
    useSiteTheme: boolean;
    showLogo: boolean;
  };
  restrictBulkEmails: {
    disabledRoles: string[];
  };
};

export const DEFAULT_JOURNAL_SETTINGS: JournalSettings = {
  context: {
    name: "",
    initials: "",
    abbreviation: "",
    publisher: "",
    issnOnline: "",
    issnPrint: "",
    focusScope: "",
  },
  search: {
    keywords: "",
    description: "",
    includeSupplemental: true,
  },
  theme: {
    theme: "default",
    headerBg: "#0a2d44",
    useSiteTheme: true,
    showLogo: true,
  },
  restrictBulkEmails: {
    disabledRoles: [],
  },
};

export const JOURNAL_ROLE_OPTIONS = [
  { value: "manager", label: "Journal Manager" },
  { value: "editor", label: "Journal Editor" },
  { value: "section_editor", label: "Section Editor" },
  { value: "guest_editor", label: "Guest Editor" },
  { value: "copyeditor", label: "Copyeditor" },
  { value: "proofreader", label: "Proofreader" },
  { value: "author", label: "Author" },
  { value: "reader", label: "Reader" },
] as const;

export type JournalRoleValue = (typeof JOURNAL_ROLE_OPTIONS)[number]["value"];


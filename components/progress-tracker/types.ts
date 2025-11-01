export type ReminderType = 'notification' | 'ringtone' | 'alarm';

export type ReminderSettings = {
  type: ReminderType;
  time: string;
  hideAfterDismiss: boolean;
};

export type TaskLink = {
  id: string;
  label: string;
  url: string;
};

export type TaskMessage = {
  id: string;
  content: string;
  createdAt: string;
};

export type TaskColumn = {
  id: string;
  title: string;
  description: string;
  criticality: number;
  highlightColor: string;
  duration: string;
  reminder: ReminderSettings;
  locked: boolean;
  image?: string;
  links: TaskLink[];
  history: TaskMessage[];
  lastUpdated: string;
  trashedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  stepRange: string;
  columnRange: string;
  description: string;
  columns: TaskColumn[];
};

export type TrackerTheme = {
  id: string;
  name: string;
  description: string;
  palette: {
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    glow: string;
  };
};

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
  ReminderType,
  TaskColumn,
  Category,
  TaskMessage,
} from '@/components/progress-tracker/types';
import { trackerThemes } from '@/components/progress-tracker/theme-presets';
import { useHistoryState } from '@/components/progress-tracker/use-history-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const CATEGORY_BLUEPRINTS: Omit<Category, 'columns'>[] = [
  {
    id: 'cat-1',
    name: 'Category 1 — Sprint Starters',
    stepRange: '3 – 10 task steps',
    columnRange: 'Ideal for 10 – 15 columns',
    description:
      'Perfect for rapid prototypes, mini launches, and focused experiments. Columns stay nimble and can be pinned for stability.',
  },
  {
    id: 'cat-2',
    name: 'Category 2 — Momentum Builders',
    stepRange: '10 – 18 task steps',
    columnRange: 'Curated for 15 – 25 columns',
    description:
      'Designed for cross-team initiatives that demand layered approvals and deeper documentation while remaining visual.',
  },
  {
    id: 'cat-3',
    name: 'Category 3 — Signature Projects',
    stepRange: '18 – 30 task steps',
    columnRange: 'Thrives with 25 – 40 columns',
    description:
      'Wrap product launches, brand refreshes, or enterprise rollouts with cinematic detail. Includes ceremony-ready highlights.',
  },
  {
    id: 'cat-4',
    name: 'Category 4 — Master Plans',
    stepRange: '30+ task steps',
    columnRange: 'Scaled for 40 – 80 columns',
    description:
      'For multi-quarter epics with deep stakeholder alignment. Unlocks precision moves, granular audit history, and trash vaulting.',
  },
];

const REMINDER_OPTIONS: { label: string; value: ReminderType }[] = [
  { label: 'Notification', value: 'notification' },
  { label: 'Subtle Ringtone', value: 'ringtone' },
  { label: 'Alarm', value: 'alarm' },
];

const HIGHLIGHT_COLORS = [
  '#ffffff',
  '#f8fafc',
  '#e2e8f0',
  '#cbd5f5',
  '#a5b4fc',
  '#60a5fa',
  '#38bdf8',
  '#22d3ee',
  '#2dd4bf',
  '#34d399',
  '#a3e635',
  '#facc15',
  '#fb923c',
  '#f97316',
  '#ef4444',
  '#dc2626',
  '#b91c1c',
  '#7f1d1d',
  '#312e81',
  '#0f172a',
];

type ColumnIdentifier = {
  columnId: string;
  categoryId: string;
};

const STORAGE_KEY = 'progress-tracker-board';

type TrackerState = {
  categories: Category[];
  trash: TaskColumn[];
};

const BASE_STATE: TrackerState = {
  categories: CATEGORY_BLUEPRINTS.map((category) => ({
    ...category,
    columns: [],
  })),
  trash: [],
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

function createEmptyColumn(): TaskColumn {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    title: 'Untitled column',
    description: '',
    criticality: 3,
    highlightColor: '#0f172a',
    duration: '45m',
    reminder: {
      type: 'notification',
      time: new Date().toISOString().slice(0, 16),
      hideAfterDismiss: false,
    },
    locked: false,
    links: [
      {
        id: makeId(),
        label: 'Primary reference',
        url: '',
      },
    ],
    history: [],
    lastUpdated: now,
  };
}

function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
    } catch (error) {
      console.warn('Notification permission request failed', error);
    }
  }, []);

  return { permission, request } as const;
}

function getCriticalityStyles(level: number) {
  if (level <= 3) {
    return {
      badge: 'from-emerald-400/80 to-emerald-600/40 text-emerald-50 border-emerald-400/60',
      dot: 'bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.28)]',
    };
  }
  if (level <= 6) {
    return {
      badge: 'from-amber-300/90 to-amber-600/40 text-amber-950 border-amber-400/60',
      dot: 'bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.28)]',
    };
  }
  if (level <= 8) {
    return {
      badge: 'from-orange-400/90 to-orange-600/40 text-orange-50 border-orange-400/60',
      dot: 'bg-orange-500 shadow-[0_0_0_6px_rgba(251,146,60,0.28)]',
    };
  }
  return {
    badge: 'from-rose-500/95 to-rose-700/40 text-rose-50 border-rose-400/70',
    dot: 'bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.32)]',
  };
}

function SortableColumn({
  column,
  onOpen,
  onToggleLock,
  onLongPress,
  selected,
  palette,
}: {
  column: TaskColumn;
  onOpen: () => void;
  onToggleLock: () => void;
  onLongPress: () => void;
  selected: boolean;
  palette: (typeof trackerThemes)[number]['palette'];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: column.locked,
  });

  const baseStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
  } as const;

  const criticality = getCriticalityStyles(column.criticality);

  const cardStyle: CSSProperties = {
    ...baseStyle,
    background: `linear-gradient(160deg, ${column.highlightColor}aa, ${column.highlightColor}22 80%)`,
    borderColor: palette.border,
    color: palette.textPrimary,
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={cardStyle}
      className={cn(
        'group relative flex h-full min-h-[240px] cursor-grab flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-lg transition-all duration-300',
        column.locked ? 'cursor-not-allowed opacity-80' : 'hover:-translate-y-1 hover:shadow-2xl',
        selected && 'ring-4 ring-offset-2 ring-offset-transparent',
        isDragging && 'scale-[1.02] shadow-3xl'
      )}
      onDoubleClick={onOpen}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
          let timeout = window.setTimeout(() => {
            onLongPress();
          }, 450);
          const clear = () => window.clearTimeout(timeout);
          event.currentTarget.addEventListener('pointerup', clear, { once: true });
          event.currentTarget.addEventListener('pointerleave', clear, { once: true });
        }
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <Badge
          className={cn(
            'flex items-center gap-2 border px-3 py-1 text-xs uppercase tracking-wide shadow-lg',
            `bg-gradient-to-br ${criticality.badge}`
          )}
        >
          <span
            className={cn('h-2 w-2 rounded-full', criticality.dot)}
            aria-hidden
          />
          Priority {column.criticality}/10
        </Badge>
        <Toggle
          pressed={column.locked}
          onPressedChange={onToggleLock}
          className="rounded-full border border-white/30 bg-white/10 px-3 text-[11px] uppercase tracking-[0.15em] text-white/80"
        >
          {column.locked ? 'Locked' : 'Lock'}
        </Toggle>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {column.image ? (
          <Image
            src={column.image}
            alt="Task avatar"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-white/40 object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-white/30 bg-white/10 text-xs uppercase tracking-[0.2em] text-white/70">
            Task
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg leading-tight text-white drop-shadow-sm">
            {column.title}
          </h3>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            {column.duration} • {column.reminder.type}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-4 text-sm text-white/80">
        {column.description || 'Quick tap to start sculpting this task. Your detail view is ready with autosave and chat.'}
      </p>
      <div className="mt-auto flex items-center justify-between pt-6">
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
          {column.links
            .filter((link) => link.url)
            .slice(0, 2)
            .map((link) => (
              <span key={link.id} className="rounded-full bg-white/15 px-3 py-1 shadow-sm">
                {link.label || 'Link'}
              </span>
            ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full border border-white/20 bg-white/10 text-xs uppercase tracking-[0.2em] text-white"
          onClick={onOpen}
        >
          Open
        </Button>
      </div>
    </motion.div>
  );
}

function CategoryDroppable({ id, count, children }: { id: string; count: number; children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative mt-6 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 transition-all lg:grid-cols-3 xl:grid-cols-4',
        isOver && 'border-white/60 bg-white/10 shadow-2xl'
      )}
    >
      {count === 0 && (
        <div className="col-span-full flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/20 text-sm uppercase tracking-[0.3em] text-white/40">
          Drop column here
        </div>
      )}
      {children}
    </div>
  );
}

function ColumnEditor({
  column,
  open,
  onClose,
  onSave,
}: {
  column: TaskColumn | null;
  open: boolean;
  onClose: () => void;
  onSave: (column: TaskColumn) => void;
}) {
  const [draft, setDraft] = useState<TaskColumn | null>(column);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setDraft(column);
  }, [column]);

  const updateDraft = <K extends keyof TaskColumn>(key: K, value: TaskColumn[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value, lastUpdated: new Date().toISOString() } : current));
  };

  if (!draft) return null;

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateDraft('image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    if (draft.links.length >= 30) return;
    updateDraft('links', [...draft.links, { id: makeId(), label: '', url: '' }]);
  };

  const updateLink = (id: string, key: 'label' | 'url', value: string) => {
    updateDraft(
      'links',
      draft.links.map((link) => (link.id === id ? { ...link, [key]: value } : link))
    );
  };

  const removeLink = (id: string) => {
    updateDraft(
      'links',
      draft.links.filter((link) => link.id !== id)
    );
  };

  const appendMessage = (content: string) => {
    if (!content.trim()) return;
    const message: TaskMessage = {
      id: makeId(),
      content,
      createdAt: new Date().toISOString(),
    };
    updateDraft('history', [...draft.history, message]);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(draft.title, 40, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Criticality: ${draft.criticality} / 10`, 40, 90);
    doc.text(`Duration: ${draft.duration}`, 40, 110);
    doc.text(`Reminder: ${draft.reminder.type} at ${new Date(draft.reminder.time).toLocaleString()}`, 40, 130);
    doc.text('Description:', 40, 160);
    const descriptionLines = doc.splitTextToSize(draft.description || 'No description yet.', 520);
    doc.text(descriptionLines, 40, 180);
    doc.text('Links:', 40, 220 + descriptionLines.length * 14);
    let offset = 240 + descriptionLines.length * 14;
    draft.links
      .filter((link) => link.url)
      .forEach((link, index) => {
        doc.text(`${index + 1}. ${link.label || 'Untitled link'} — ${link.url}`, 48, offset);
        offset += 18;
      });
    doc.text('Recent updates:', 40, offset + 20);
    draft.history.slice(-6).forEach((message, index) => {
      const lines = doc.splitTextToSize(`• ${new Date(message.createdAt).toLocaleString()}: ${message.content}`, 520);
      doc.text(lines, 48, offset + 40 + index * 22);
    });
    doc.save(`${draft.title.replace(/\s+/g, '-').toLowerCase()}-profile.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : null)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-none bg-slate-900/90 text-slate-100 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4 text-2xl font-semibold">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full"
                style={{ background: draft.highlightColor }}
              />
              <div>
                <Input
                  value={draft.title}
                  onChange={(event) => updateDraft('title', event.target.value)}
                  className="border-none bg-transparent px-0 text-2xl font-semibold text-white focus-visible:ring-0"
                />
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
                  Last update {new Date(draft.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportPdf}>
                Share PDF
              </Button>
              <Button variant="default" size="sm" onClick={() => draft && onSave(draft)}>
                Save & Close
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 bg-white/10 text-white/80">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="chat">Messenger</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(event) => updateDraft('description', event.target.value.slice(0, 10000))}
                  className="min-h-[160px] rounded-2xl border border-white/10 bg-white/5 text-sm text-white"
                />
                <p className="text-right text-[11px] text-white/40">{draft.description.length}/10,000</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Criticality</Label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={draft.criticality}
                    onChange={(event) => updateDraft('criticality', Number(event.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Ease</span>
                    <span className="font-semibold">{draft.criticality}</span>
                    <span>Fire alert</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Time commitment</Label>
                  <Input
                    value={draft.duration}
                    onChange={(event) => updateDraft('duration', event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Reminder type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {REMINDER_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={draft.reminder.type === option.value ? 'default' : 'outline'}
                        className={cn(
                          'rounded-2xl border border-white/20 bg-white/10 text-xs uppercase tracking-[0.2em] transition',
                          draft.reminder.type === option.value && 'border-white/60 bg-white/30 text-slate-900'
                        )}
                        onClick={() => updateDraft('reminder', { ...draft.reminder, type: option.value })}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Reminder moment</Label>
                  <Input
                    type="datetime-local"
                    value={draft.reminder.time}
                    onChange={(event) => updateDraft('reminder', { ...draft.reminder, time: event.target.value })}
                    className="rounded-2xl border border-white/10 bg-white/5 text-white"
                  />
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Hide after dismiss?</span>
                    <Switch
                      checked={draft.reminder.hideAfterDismiss}
                      onCheckedChange={(value) => updateDraft('reminder', { ...draft.reminder, hideAfterDismiss: value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Task avatar</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
                    className="rounded-2xl border border-dashed border-white/20 bg-white/5 text-white"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.3em] text-white/60">Highlight vibe</Label>
              <div className="mt-3 grid grid-cols-10 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    style={{ background: color }}
                    onClick={() => updateDraft('highlightColor', color)}
                    className={cn(
                      'aspect-square rounded-full border transition-transform duration-200 hover:scale-105',
                      draft.highlightColor === color ? 'border-white ring-2 ring-white/80' : 'border-white/20'
                    )}
                    aria-label={`Use ${color} highlight`}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="links" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Resource runway ({draft.links.length}/30)
              </h4>
              <Button disabled={draft.links.length >= 30} onClick={addLink} size="sm">
                Add link slot
              </Button>
            </div>
            <div className="space-y-3">
              {draft.links.map((link, index) => (
                <div
                  key={link.id}
                  className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-inner"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
                    Link {index + 1}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="Friendly label"
                      value={link.label}
                      onChange={(event) => updateLink(link.id, 'label', event.target.value)}
                      className="rounded-xl border border-white/10 bg-white/10 text-white"
                    />
                    <Input
                      placeholder="https://"
                      value={link.url}
                      onChange={(event) => updateLink(link.id, 'url', event.target.value)}
                      className="rounded-xl border border-white/10 bg-white/10 text-white"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeLink(link.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="chat" className="mt-4 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                Messenger stream
              </p>
              <div className="mt-4 space-y-3">
                {draft.history.length === 0 && (
                  <p className="text-sm text-white/40">
                    Start the thread with tactical notes, voice-of-customer highlights, or celebratory confetti.
                  </p>
                )}
                {draft.history.map((message) => (
                  <div key={message.id} className="flex flex-col items-end gap-1 text-right">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                    <div className="inline-flex max-w-[80%] rounded-2xl bg-white/80 px-3 py-2 text-xs text-slate-900 shadow-lg">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form
              className="flex items-center gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);
                const text = String(formData.get('message') ?? '');
                appendMessage(text);
                form.reset();
              }}
            >
              <Textarea
                name="message"
                placeholder="Drop the update, we auto-route it."
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 text-sm text-white"
              />
              <Button type="submit" className="rounded-full px-6">
                Send
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function ProgressTrackerPage() {
  const [selectedThemeId, setSelectedThemeId] = useState(trackerThemes[0].id);
  const theme = trackerThemes.find((preset) => preset.id === selectedThemeId) ?? trackerThemes[0];
  const [activeColumn, setActiveColumn] = useState<TaskColumn | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selection, setSelection] = useState<ColumnIdentifier[]>([]);
  const [activeChatTarget, setActiveChatTarget] = useState<string | null>(null);
  const { permission, request } = useNotificationPermission();

  const closeAdvancedPanel = useCallback(() => {
    setAdvancedMode(false);
    setSelection([]);
    setActiveChatTarget(null);
  }, []);

  const { state, setState, undo, redo, canUndo, canRedo } = useHistoryState<TrackerState>(BASE_STATE, {
    limit: 7,
    storageKey: STORAGE_KEY,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  const openColumn = (column: TaskColumn) => {
    setActiveColumn(column);
    setIsEditorOpen(true);
  };

  const updateColumn = useCallback(
    (columnId: string, updater: (column: TaskColumn) => TaskColumn) => {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((category) => ({
          ...category,
          columns: category.columns.map((column) => (column.id === columnId ? updater(column) : column)),
        })),
      }));
    },
    [setState]
  );

  const removeColumn = useCallback(
    (columnId: string) => {
      setState((prev) => {
        const { categories, trash } = prev;
        let removed: TaskColumn | null = null;
        const nextCategories = categories.map((category) => ({
          ...category,
          columns: category.columns.filter((column) => {
            if (column.id === columnId) {
              removed = { ...column, trashedAt: new Date().toISOString() };
              return false;
            }
            return true;
          }),
        }));
        return {
          categories: nextCategories,
          trash: removed ? [removed, ...trash].slice(0, 100) : trash,
        };
      });
    },
    [setState]
  );

  const handleEditorSave = (column: TaskColumn) => {
    updateColumn(column.id, () => ({ ...column, lastUpdated: new Date().toISOString() }));
    setIsEditorOpen(false);
  };

  const handleAddColumn = (categoryId: string) => {
    const column = createEmptyColumn();
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              columns: [...category.columns, column],
            }
          : category
      ),
    }));
    setTimeout(() => {
      openColumn(column);
    }, 50);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setSelection([]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setState((prev) => {
      let sourceCategoryId: string | null = null;
      let destinationCategoryId: string | null = null;
      let activeColumn: TaskColumn | null = null;
      const categories = prev.categories.map((category) => {
        if (category.columns.some((column) => column.id === activeId)) {
          sourceCategoryId = category.id;
        }
        if (category.columns.some((column) => column.id === overId) || category.id === overId) {
          destinationCategoryId = category.id;
        }
        return category;
      });

      if (!sourceCategoryId || !destinationCategoryId) {
        return prev;
      }

      const nextCategories = categories.map((category) => {
        if (category.id === sourceCategoryId) {
          const activeIndex = category.columns.findIndex((column) => column.id === activeId);
          activeColumn = category.columns[activeIndex];
          const filtered = category.columns.filter((column) => column.id !== activeId);
          return { ...category, columns: filtered };
        }
        return category;
      });

      if (!activeColumn) return prev;

      const nextState = {
        categories: nextCategories.map((category) => {
        if (category.id === destinationCategoryId) {
          const overIndex = category.columns.findIndex((column) => column.id === overId);
          const insertIndex = overIndex === -1 ? category.columns.length : overIndex;
          const newColumns = [...category.columns];
          newColumns.splice(insertIndex, 0, activeColumn!);
          return { ...category, columns: newColumns };
          }
          return category;
        }),
        trash: prev.trash,
      } satisfies TrackerState;

      return nextState;
    });
  };

  const toggleSelection = useCallback(
    (identifier: ColumnIdentifier) => {
      setSelection((prev) => {
        const exists = prev.some((item) => item.columnId === identifier.columnId);
        if (exists) {
          return prev.filter((item) => item.columnId !== identifier.columnId);
        }
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, identifier];
      });
      setAdvancedMode(true);
      setActiveChatTarget(identifier.columnId);
    },
    []
  );

  const selectedColumns = useMemo(() => {
    return selection
      .map((item) => {
        const category = state.categories.find((cat) => cat.id === item.categoryId);
        const column = category?.columns.find((col) => col.id === item.columnId);
        return column ?? null;
      })
      .filter(Boolean) as TaskColumn[];
  }, [selection, state.categories]);

  const handleAdvancedMessage = (content: string) => {
    if (!activeChatTarget || !content.trim()) return;
    updateColumn(activeChatTarget, (column) => ({
      ...column,
      history: [
        ...column.history,
        { id: makeId(), content, createdAt: new Date().toISOString() },
      ],
    }));
  };

  const handleHighlight = (color: string) => {
    selection.forEach((item) => {
      updateColumn(item.columnId, (column) => ({ ...column, highlightColor: color }));
    });
  };

  const handleMove = (line: number) => {
    if (!selection.length) return;
    setState((prev) => {
      const { categories } = prev;
      const nextCategories = categories.map((category) => {
        const columnIds = selection
          .filter((item) => item.categoryId === category.id)
          .map((item) => item.columnId);
        if (!columnIds.length) {
          return category;
        }
        const selectedColumns = category.columns.filter((column) => columnIds.includes(column.id));
        const remaining = category.columns.filter((column) => !columnIds.includes(column.id));
        const insertIndex = Math.max(0, Math.min(line - 1, remaining.length));
        const newColumns = [
          ...remaining.slice(0, insertIndex),
          ...selectedColumns,
          ...remaining.slice(insertIndex),
        ];
        return { ...category, columns: newColumns };
      });
      return { categories: nextCategories, trash: prev.trash } satisfies TrackerState;
    });
  };

  const handleDeleteSelection = () => {
    selection.forEach((item) => removeColumn(item.columnId));
    closeAdvancedPanel();
  };

  const layoutStyle = {
    background: theme.palette.background,
  } as const;

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={layoutStyle}
    >
      <div className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)] opacity-70" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-6 py-12">
          <header className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                Atmosphere-aware project architect
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-white drop-shadow-xl md:text-5xl">
                Progress Pilot
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80">
                Craft stunning, fully-custom boards on the fly. Autosave, undo history, precision moves, and a broadcast messenger keep every column alive. Long-press any column to unlock the advanced toolkit.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Autosave enabled</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">7-step undo/redo</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Notification ready ({permission})</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 text-white/80 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Choose your vibe</p>
              <div className="flex flex-wrap gap-2">
                {trackerThemes.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedThemeId(preset.id)}
                    className={cn(
                      'flex w-full min-w-[180px] flex-1 flex-col gap-2 rounded-2xl border border-white/10 p-3 text-left text-sm transition md:w-auto',
                      selectedThemeId === preset.id ? 'border-white/70 bg-white/20 shadow-xl' : 'hover:bg-white/15'
                    )}
                  >
                    <span className="font-semibold text-white">{preset.name}</span>
                    <span className="text-xs text-white/70">{preset.description}</span>
                    <span
                      className="mt-2 h-2 rounded-full"
                      style={{ background: preset.palette.accent, boxShadow: preset.palette.glow }}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={request} className="flex-1 rounded-full">
                  Request notifications
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  Undo
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  Redo
                </Button>
              </div>
            </div>
          </header>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <section className="mt-12 space-y-10">
              {state.categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{category.stepRange}</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white drop-shadow-sm">
                        {category.name}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm text-white/70">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
                        {category.columns.length} columns live
                      </Badge>
                      <Button
                        variant="default"
                        className="rounded-full"
                        onClick={() => handleAddColumn(category.id)}
                      >
                        Add column
                      </Button>
                    </div>
                  </div>

                  <SortableContext
                    id={category.id}
                    items={category.columns.map((column) => column.id)}
                    strategy={rectSortingStrategy}
                  >
                    <CategoryDroppable id={category.id} count={category.columns.length}>
                      <AnimatePresence>
                        {category.columns.map((column) => (
                          <motion.div
                            key={column.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                          >
                            <SortableColumn
                              column={column}
                              onOpen={() => openColumn(column)}
                              onToggleLock={() =>
                                updateColumn(column.id, (current) => ({
                                  ...current,
                                  locked: !current.locked,
                                }))
                              }
                              onLongPress={() =>
                                toggleSelection({ columnId: column.id, categoryId: category.id })
                              }
                              selected={selection.some((item) => item.columnId === column.id)}
                              palette={theme.palette}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </CategoryDroppable>
                  </SortableContext>
                </div>
              ))}
            </section>
          </DndContext>

          <section className="mt-16 rounded-3xl border border-white/15 bg-white/10 p-6 text-white/70">
            <h3 className="text-lg font-semibold text-white">Trash vault</h3>
            <p className="text-sm text-white/60">
              Columns rest here for 30 days before dissolving. Restore coming soon — export or duplicate before they fade.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.trash.length === 0 && <p className="text-sm text-white/50">No items resting in the vault.</p>}
              {state.trash.map((column) => (
                <div
                  key={column.id}
                  className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white">{column.title}</p>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {column.trashedAt ? new Date(column.trashedAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs text-white/50">{column.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <ColumnEditor
        column={activeColumn}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleEditorSave}
      />

      <AnimatePresence>
        {advancedMode && selection.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.28 }}
            className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,900px)] -translate-x-1/2 rounded-3xl border border-white/20 bg-white/20 p-6 text-white shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Advanced column UI</p>
                <h4 className="text-lg font-semibold text-white">
                  {selection.length} column{selection.length > 1 ? 's' : ''} locked in
                </h4>
              </div>
              <Button variant="ghost" onClick={closeAdvancedPanel}>
                Close
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Actions</p>
                <div className="flex flex-wrap gap-3">
                  {selection.length >= 2 && (
                    <Button
                      variant="secondary"
                      disabled={selection.length > 3}
                      onClick={() => {
                        if (selection.length > 3) return;
                        const target = selection[selection.length - 1]?.columnId ?? null;
                        setActiveChatTarget(target);
                      }}
                      className="rounded-full"
                    >
                      Open windows
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => handleHighlight(theme.palette.accent)}
                  >
                    Highlight
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => handleMove(1)}
                  >
                    Move → line
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-full"
                    onClick={handleDeleteSelection}
                  >
                    Delete
                  </Button>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color}
                      style={{ background: color }}
                      className="aspect-square rounded-full border border-white/20"
                      onClick={() => handleHighlight(color)}
                    />
                  ))}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const line = Number(formData.get('line') ?? 1);
                    handleMove(line);
                  }}
                  className="flex items-center gap-3"
                >
                  <Input
                    type="number"
                    name="line"
                    min={1}
                    defaultValue={1}
                    className="w-32 rounded-full border border-white/20 bg-white/10 text-white"
                    placeholder="Line"
                  />
                  <Button type="submit" variant="outline" className="rounded-full">
                    Move precisely
                  </Button>
                </form>
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Broadcast messenger</p>
                <div className="flex gap-2">
                  {selectedColumns.map((column) => (
                    <button
                      key={column.id}
                      onClick={() => setActiveChatTarget(column.id)}
                      className={cn(
                        'flex-1 rounded-2xl border border-white/10 bg-white/10 p-3 text-left text-sm transition',
                        activeChatTarget === column.id && 'border-white/60 bg-white/25 text-slate-900'
                      )}
                    >
                      <p className="font-semibold">{column.title}</p>
                      <p className="text-xs text-white/70">Tap to route next message</p>
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const text = String(new FormData(event.currentTarget).get('message') ?? '');
                    handleAdvancedMessage(text);
                    event.currentTarget.reset();
                  }}
                  className="flex items-center gap-3"
                >
                  <Textarea
                    name="message"
                    placeholder={
                      activeChatTarget
                        ? 'Type once, deliver to the selected column messenger.'
                        : 'Select a column to start chatting.'
                    }
                    disabled={!activeChatTarget}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/10 text-sm text-white"
                  />
                  <Button type="submit" disabled={!activeChatTarget} className="rounded-full px-6">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

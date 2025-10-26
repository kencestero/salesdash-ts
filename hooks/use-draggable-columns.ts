// Draggable Table Columns Hook
// Allows users to reorder table columns and saves preferences to cookies

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'select', label: 'Select', visible: true, order: 0, width: 'w-12' },
  { id: 'vin', label: 'VIN', visible: true, order: 1, width: 'w-40' },
  { id: 'stockNumber', label: 'Stock #', visible: true, order: 2, width: 'w-32' },
  { id: 'image', label: 'Image', visible: true, order: 3, width: 'w-24' },
  { id: 'size', label: 'Size', visible: true, order: 4, width: 'w-32' },
  { id: 'details', label: 'Details', visible: true, order: 5, width: 'w-48' },
  { id: 'price', label: 'Price', visible: true, order: 6, width: 'w-36' },
  { id: 'status', label: 'Status', visible: true, order: 7, width: 'w-28' },
  { id: 'notes', label: 'Notes', visible: true, order: 8, width: 'w-20' },
  { id: 'actions', label: 'Actions', visible: true, order: 9, width: 'w-28' },
];

const COOKIE_NAME = 'mj-inventory-columns';
const COOKIE_EXPIRY_DAYS = 365;

export function useDraggableColumns() {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Load saved column preferences from cookies
  useEffect(() => {
    const savedConfig = Cookies.get(COOKIE_NAME);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Merge with default columns in case new columns were added
        const mergedColumns = DEFAULT_COLUMNS.map(defaultCol => {
          const saved = parsed.find((col: ColumnConfig) => col.id === defaultCol.id);
          return saved || defaultCol;
        });
        setColumns(mergedColumns.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Failed to parse column config from cookies:', error);
      }
    }
  }, []);

  // Save column preferences to cookies
  const saveColumnConfig = (newColumns: ColumnConfig[]) => {
    Cookies.set(COOKIE_NAME, JSON.stringify(newColumns), { 
      expires: COOKIE_EXPIRY_DAYS 
    });
    setColumns(newColumns);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    const updated = columns.map(col => 
      col.id === columnId 
        ? { ...col, visible: !col.visible }
        : col
    );
    saveColumnConfig(updated);
  };

  // Reset to default column configuration
  const resetColumns = () => {
    Cookies.remove(COOKIE_NAME);
    setColumns(DEFAULT_COLUMNS);
  };

  // Drag and Drop handlers
  const handleDragStart = (columnId: string) => {
    setIsDragging(true);
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumnId) {
      handleDragEnd();
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      handleDragEnd();
      return;
    }

    // Reorder columns
    const reordered = [...columns];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    
    // Update order numbers
    const updated = reordered.map((col, index) => ({
      ...col,
      order: index
    }));
    
    saveColumnConfig(updated);
    handleDragEnd();
  };

  // Move column programmatically
  const moveColumn = (columnId: string, direction: 'left' | 'right') => {
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(columns.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const reordered = [...columns];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, removed);
    
    const updated = reordered.map((col, index) => ({
      ...col,
      order: index
    }));
    
    saveColumnConfig(updated);
  };

  return {
    columns: columns.filter(col => col.visible),
    allColumns: columns,
    isDragging,
    draggedColumn,
    dragOverColumn,
    toggleColumnVisibility,
    resetColumns,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    moveColumn,
    saveColumnConfig
  };
}

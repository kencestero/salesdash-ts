// Column Manager Component
// UI for managing table column visibility and order

import React from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColumnConfig } from '@/hooks/use-draggable-columns';

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onToggleVisibility: (columnId: string) => void;
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void;
  onReset: () => void;
  onDragStart: (columnId: string) => void;
  onDragOver: (e: React.DragEvent, columnId: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
}

export function ColumnManager({
  columns,
  onToggleVisibility,
  onMoveColumn,
  onReset,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: ColumnManagerProps) {
  const visibleCount = columns.filter(col => col.visible).length;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-[#1a1d29] border-gray-700 text-white hover:bg-[#0f1117] hover:border-orange-500"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Columns
          <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">
            {visibleCount}/{columns.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1d29] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            Column Settings
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Drag to reorder, toggle visibility, or use arrow buttons to move columns.
            Settings are saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {columns
              .sort((a, b) => a.order - b.order)
              .map((column, index) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={() => onDragStart(column.id)}
                  onDragOver={(e) => onDragOver(e, column.id)}
                  onDragEnd={onDragEnd}
                  onDrop={(e) => onDrop(e, column.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-move
                    ${column.visible 
                      ? 'bg-[#0f1117] border-gray-700 hover:border-orange-500' 
                      : 'bg-gray-800/50 border-gray-800 opacity-60'
                    }
                  `}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-5 w-5 text-gray-500" />
                  
                  {/* Column Name */}
                  <div className="flex-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      {column.visible ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                      {column.label}
                    </Label>
                  </div>
                  
                  {/* Position Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onMoveColumn(column.id, 'left')}
                      disabled={index === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onMoveColumn(column.id, 'right')}
                      disabled={index === columns.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Visibility Toggle */}
                  <Switch
                    checked={column.visible}
                    onCheckedChange={() => onToggleVisibility(column.id)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              ))}
          </div>
        </ScrollArea>
        
        <div className="text-sm text-gray-500 mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            <span>Drag columns to reorder</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch className="h-4 w-4 pointer-events-none opacity-50" />
            <span>Toggle column visibility</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="h-4 px-1 bg-orange-500">↺</Badge>
            <span>Settings saved to cookies (365 days)</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

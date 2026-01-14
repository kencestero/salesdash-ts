"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Trash2,
  Edit,
  Image,
  Video,
  FileText,
  GripVertical,
  Upload,
  Eye,
  Loader2,
  Settings,
  LayoutGrid,
  Play,
  ExternalLink,
} from "lucide-react";

interface Slide {
  id: string;
  contentType: "IMAGE" | "VIDEO" | "TEXT_ONLY";
  layoutType: "FULL_MEDIA" | "MEDIA_CAPTION" | "SPLIT_LEFT" | "SPLIT_RIGHT";
  mediaUrl?: string;
  mediaDriveId?: string;
  mediaAlt?: string;
  youtubeId?: string;
  title?: string;
  description?: string;
  textColor?: string;
  backgroundColor?: string;
  linkUrl?: string;
  linkText?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface Slideshow {
  id: string;
  name: string;
  isActive: boolean;
  rotationSpeed: number;
  slides: Slide[];
  createdBy?: { name: string };
  createdAt: string;
  updatedAt: string;
}

const ROTATION_SPEEDS = [
  { value: 3000, label: "3 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 10000, label: "10 seconds" },
  { value: 15000, label: "15 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
];

const LAYOUT_OPTIONS = [
  { value: "FULL_MEDIA", label: "Full Media", icon: LayoutGrid },
  { value: "MEDIA_CAPTION", label: "Media + Caption", icon: FileText },
  { value: "SPLIT_LEFT", label: "Media Left", icon: LayoutGrid },
  { value: "SPLIT_RIGHT", label: "Media Right", icon: LayoutGrid },
];

const CONTENT_TYPES = [
  { value: "IMAGE", label: "Image", icon: Image },
  { value: "VIDEO", label: "Video", icon: Video },
  { value: "TEXT_ONLY", label: "Text Only", icon: FileText },
];

export default function DashboardContentManager() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [selectedSlideshow, setSelectedSlideshow] = useState<Slideshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [showNewSlideshowDialog, setShowNewSlideshowDialog] = useState(false);
  const [showEditSlideDialog, setShowEditSlideDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  // Form states
  const [newSlideshowName, setNewSlideshowName] = useState("");
  const [slideForm, setSlideForm] = useState<Partial<Slide>>({
    contentType: "IMAGE",
    layoutType: "FULL_MEDIA",
    textColor: "#FFFFFF",
    backgroundColor: "#000000",
  });
  const [uploading, setUploading] = useState(false);

  // Fetch slideshows
  const fetchSlideshows = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard-content/slideshows");
      if (response.ok) {
        const data = await response.json();
        setSlideshows(data.slideshows || []);
        // Select first active or first slideshow
        if (data.slideshows?.length > 0) {
          const active = data.slideshows.find((s: Slideshow) => s.isActive);
          setSelectedSlideshow(active || data.slideshows[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching slideshows:", error);
      toast({ title: "Error", description: "Failed to load slideshows", color: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlideshows();
  }, [fetchSlideshows]);

  // Create new slideshow
  const handleCreateSlideshow = async () => {
    if (!newSlideshowName.trim()) {
      toast({ title: "Error", description: "Please enter a name", color: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/dashboard-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSlideshowName, isActive: true }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: "Success", description: "Slideshow created" });
        setShowNewSlideshowDialog(false);
        setNewSlideshowName("");
        await fetchSlideshows();
        setSelectedSlideshow(data.slideshow);
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error, color: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create slideshow", color: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Update slideshow settings
  const handleUpdateSlideshow = async (updates: Partial<Slideshow>) => {
    if (!selectedSlideshow) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard-content/slideshows/${selectedSlideshow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Settings updated" });
        await fetchSlideshows();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error, color: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", color: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete slideshow
  const handleDeleteSlideshow = async () => {
    if (!selectedSlideshow) return;
    if (!confirm(`Delete "${selectedSlideshow.name}"? This cannot be undone.`)) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard-content/slideshows/${selectedSlideshow.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Slideshow deleted" });
        setSelectedSlideshow(null);
        await fetchSlideshows();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete slideshow", color: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/dashboard-content/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSlideForm((prev) => ({
          ...prev,
          mediaUrl: data.embedUrl,
          mediaDriveId: data.fileId,
        }));
        toast({ title: "Success", description: "File uploaded" });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error, color: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload file", color: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Create/Update slide
  const handleSaveSlide = async () => {
    if (!selectedSlideshow) return;

    setSaving(true);
    try {
      const isEditing = !!editingSlide;
      const url = isEditing
        ? `/api/dashboard-content/slides/${editingSlide.id}`
        : "/api/dashboard-content/slides";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slideForm,
          slideshowId: selectedSlideshow.id,
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: isEditing ? "Slide updated" : "Slide created" });
        setShowEditSlideDialog(false);
        resetSlideForm();
        await fetchSlideshows();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error, color: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save slide", color: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete slide
  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Delete this slide?")) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard-content/slides/${slideId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Slide deleted" });
        await fetchSlideshows();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete slide", color: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Reset slide form
  const resetSlideForm = () => {
    setEditingSlide(null);
    setSlideForm({
      contentType: "IMAGE",
      layoutType: "FULL_MEDIA",
      textColor: "#FFFFFF",
      backgroundColor: "#000000",
    });
  };

  // Open edit slide dialog
  const openEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setSlideForm({
      contentType: slide.contentType,
      layoutType: slide.layoutType,
      mediaUrl: slide.mediaUrl,
      mediaDriveId: slide.mediaDriveId,
      mediaAlt: slide.mediaAlt,
      youtubeId: slide.youtubeId,
      title: slide.title,
      description: slide.description,
      textColor: slide.textColor,
      backgroundColor: slide.backgroundColor,
      linkUrl: slide.linkUrl,
      linkText: slide.linkText,
      isActive: slide.isActive,
    });
    setShowEditSlideDialog(true);
  };

  // Open new slide dialog
  const openNewSlide = () => {
    resetSlideForm();
    setShowEditSlideDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E96114]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Content Manager</h1>
          <p className="text-muted-foreground">
            Manage slideshows, images, and videos for the dashboard announcement area
          </p>
        </div>
        <Button onClick={() => setShowNewSlideshowDialog(true)} className="bg-[#E96114] hover:bg-[#E96114]/90">
          <Plus className="w-4 h-4 mr-2" />
          New Slideshow
        </Button>
      </div>

      {/* Slideshow Selector */}
      {slideshows.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>Active Slideshow:</Label>
          <Select
            value={selectedSlideshow?.id || ""}
            onValueChange={(id) => {
              const show = slideshows.find((s) => s.id === id);
              setSelectedSlideshow(show || null);
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select slideshow" />
            </SelectTrigger>
            <SelectContent>
              {slideshows.map((show) => (
                <SelectItem key={show.id} value={show.id}>
                  {show.name} {show.isActive && <Badge className="ml-2 bg-green-500">Active</Badge>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSlideshow && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              {!selectedSlideshow.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateSlideshow({ isActive: true })}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Make Active
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* No slideshows message */}
      {slideshows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Slideshows Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first slideshow to start adding content to the dashboard
            </p>
            <Button onClick={() => setShowNewSlideshowDialog(true)} className="bg-[#E96114] hover:bg-[#E96114]/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Slideshow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Slides Grid */}
      {selectedSlideshow && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedSlideshow.name}</CardTitle>
              <CardDescription>
                {selectedSlideshow.slides.length} slides • Rotates every{" "}
                {selectedSlideshow.rotationSpeed / 1000}s
              </CardDescription>
            </div>
            <Button onClick={openNewSlide} className="bg-[#E96114] hover:bg-[#E96114]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </CardHeader>
          <CardContent>
            {selectedSlideshow.slides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Image className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No slides yet. Add your first slide.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSlideshow.slides.map((slide, index) => (
                  <Card
                    key={slide.id}
                    className={`relative overflow-hidden ${!slide.isActive ? "opacity-50" : ""}`}
                  >
                    {/* Slide Preview */}
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{ backgroundColor: slide.backgroundColor || "#000" }}
                    >
                      {slide.contentType === "IMAGE" && slide.mediaUrl ? (
                        <img
                          src={slide.mediaUrl}
                          alt={slide.mediaAlt || "Slide"}
                          className="w-full h-full object-cover"
                        />
                      ) : slide.contentType === "VIDEO" ? (
                        <Video className="w-12 h-12 text-white/50" />
                      ) : (
                        <FileText className="w-12 h-12 text-white/50" />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <Badge variant="soft" className="text-xs">
                            {slide.contentType}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditSlide(slide)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSlide(slide.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {slide.title && (
                        <p className="text-sm font-medium truncate">{slide.title}</p>
                      )}
                      {!slide.isActive && (
                        <Badge variant="soft" className="mt-1">
                          Inactive
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Slideshow Dialog */}
      <Dialog open={showNewSlideshowDialog} onOpenChange={setShowNewSlideshowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Slideshow</DialogTitle>
            <DialogDescription>
              Create a new slideshow to display on the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Slideshow Name</Label>
              <Input
                placeholder="e.g., January Announcements"
                value={newSlideshowName}
                onChange={(e) => setNewSlideshowName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSlideshowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSlideshow} disabled={saving} className="bg-[#E96114]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slideshow Settings</DialogTitle>
            <DialogDescription>Configure rotation speed and other settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={selectedSlideshow?.name || ""}
                onChange={(e) =>
                  setSelectedSlideshow((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Rotation Speed</Label>
              <Select
                value={String(selectedSlideshow?.rotationSpeed || 5000)}
                onValueChange={(value) =>
                  setSelectedSlideshow((prev) =>
                    prev ? { ...prev, rotationSpeed: parseInt(value) } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROTATION_SPEEDS.map((speed) => (
                    <SelectItem key={speed.value} value={String(speed.value)}>
                      {speed.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={selectedSlideshow?.isActive || false}
                onCheckedChange={(checked) =>
                  setSelectedSlideshow((prev) => (prev ? { ...prev, isActive: checked } : null))
                }
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              color="destructive"
              onClick={handleDeleteSlideshow}
              disabled={saving}
            >
              Delete Slideshow
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedSlideshow) {
                    handleUpdateSlideshow({
                      name: selectedSlideshow.name,
                      rotationSpeed: selectedSlideshow.rotationSpeed,
                      isActive: selectedSlideshow.isActive,
                    });
                  }
                  setShowSettingsDialog(false);
                }}
                disabled={saving}
                className="bg-[#E96114]"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slide Dialog */}
      <Dialog open={showEditSlideDialog} onOpenChange={setShowEditSlideDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Content Type */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="flex gap-2">
                {CONTENT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={slideForm.contentType === type.value ? "default" : "outline"}
                    onClick={() => setSlideForm((prev) => ({ ...prev, contentType: type.value as Slide["contentType"] }))}
                    className={slideForm.contentType === type.value ? "bg-[#E96114]" : ""}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Layout Type */}
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={slideForm.layoutType}
                onValueChange={(value) =>
                  setSlideForm((prev) => ({ ...prev, layoutType: value as Slide["layoutType"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value}>
                      {layout.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Media Upload (for IMAGE/VIDEO) */}
            {slideForm.contentType !== "TEXT_ONLY" && (
              <div className="space-y-2">
                <Label>Media</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Media URL or upload a file"
                      value={slideForm.mediaUrl || ""}
                      onChange={(e) => setSlideForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Button variant="outline" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {slideForm.mediaUrl && slideForm.contentType === "IMAGE" && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img src={slideForm.mediaUrl} alt="Preview" className="max-h-40 object-contain mx-auto" />
                  </div>
                )}
              </div>
            )}

            {/* YouTube ID (for VIDEO) */}
            {slideForm.contentType === "VIDEO" && (
              <div className="space-y-2">
                <Label>YouTube Video ID (optional)</Label>
                <Input
                  placeholder="e.g., dQw4w9WgXcQ"
                  value={slideForm.youtubeId || ""}
                  onChange={(e) => setSlideForm((prev) => ({ ...prev, youtubeId: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the video ID from a YouTube URL (the part after v=)
                </p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                placeholder="Slide title"
                value={slideForm.title || ""}
                onChange={(e) => setSlideForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Slide description or announcement text"
                value={slideForm.description || ""}
                onChange={(e) => setSlideForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={slideForm.textColor || "#FFFFFF"}
                    onChange={(e) => setSlideForm((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={slideForm.textColor || "#FFFFFF"}
                    onChange={(e) => setSlideForm((prev) => ({ ...prev, textColor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={slideForm.backgroundColor || "#000000"}
                    onChange={(e) => setSlideForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={slideForm.backgroundColor || "#000000"}
                    onChange={(e) => setSlideForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label>Link URL (optional)</Label>
              <Input
                placeholder="https://..."
                value={slideForm.linkUrl || ""}
                onChange={(e) => setSlideForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
              />
            </div>
            {slideForm.linkUrl && (
              <div className="space-y-2">
                <Label>Link Text</Label>
                <Input
                  placeholder="Learn more"
                  value={slideForm.linkText || ""}
                  onChange={(e) => setSlideForm((prev) => ({ ...prev, linkText: e.target.value }))}
                />
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Label>Slide Active</Label>
              <Switch
                checked={slideForm.isActive !== false}
                onCheckedChange={(checked) => setSlideForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSlideDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSlide} disabled={saving} className="bg-[#E96114]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingSlide ? "Save Changes" : "Add Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

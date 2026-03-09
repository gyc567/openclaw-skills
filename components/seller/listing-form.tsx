"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { categories } from "@/lib/skills-data";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { parseMdFile, isValidMdFile } from "./md-parser";

interface ListingFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  priceUsd: number;
  version: string;
  packageUrl: string;
}

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ListingForm({ onSubmit, isLoading = false }: ListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    name: "",
    description: "",
    category: "general",
    tags: [],
    priceUsd: 0,
    version: "1.0.0",
    packageUrl: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!isValidMdFile(file.name)) {
      setUploadError("Please upload a .md file");
      return;
    }

    try {
      const content = await file.text();
      const parsed = parseMdFile(content);

      setFormData((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        description: parsed.description || prev.description,
        category: parsed.category || prev.category,
        tags: parsed.tags?.length ? parsed.tags : prev.tags,
        priceUsd: parsed.priceUsd ?? prev.priceUsd,
        version: parsed.version || prev.version,
        packageUrl: parsed.packageUrl || prev.packageUrl,
      }));
    } catch {
      setUploadError("Failed to parse file");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof ListingFormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="bg-secondary/50 border-accent-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create New Listing</CardTitle>
            <CardDescription>
              List your skill for sale on the marketplace
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              onChange={handleFileUpload}
              className="hidden"
              id="md-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload MD
            </Button>
            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Skill"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Describe what your skill does..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUsd">Price (USD) *</Label>
              <Input
                id="priceUsd"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.priceUsd}
                onChange={(e) => handleChange("priceUsd", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-accent"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.0.0"
                value={formData.version}
                onChange={(e) => handleChange("version", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageUrl">Package URL *</Label>
              <Input
                id="packageUrl"
                placeholder="https://..."
                value={formData.packageUrl}
                onChange={(e) => handleChange("packageUrl", e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

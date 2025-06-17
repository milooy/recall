"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBookmark } from "@/lib/bookmarks";
import { TagInput } from "@/components/TagInput";
import { addTagToBookmark } from "@/lib/tags";
import { getFolders } from "@/lib/folders";
import { Database } from "@/lib/supabase";

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface AddBookmarkDialogProps {
  onBookmarkAdded: () => void;
  selectedFolderId?: string;
}

export const AddBookmarkDialog = ({
  onBookmarkAdded,
  selectedFolderId,
}: AddBookmarkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    memo: "",
    folder_id: selectedFolderId || "",
  });
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // 폴더 목록 로드
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const foldersData = await getFolders();
        setFolders(foldersData);
      } catch (error) {
        console.error("폴더 로딩 실패:", error);
      }
    };
    loadFolders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) return;

    setLoading(true);
    try {
      const bookmark = await createBookmark({
        url: formData.url.trim(),
        title: formData.title.trim() || undefined,
        memo: formData.memo.trim() || undefined,
        folder_id: formData.folder_id || undefined,
      });

      // 태그 추가
      for (const tag of selectedTags) {
        await addTagToBookmark(bookmark.id, tag.id);
      }

      // 폼 초기화
      setFormData({
        url: "",
        title: "",
        memo: "",
        folder_id: selectedFolderId || "",
      });
      setSelectedTags([]);
      setOpen(false);
      onBookmarkAdded();
    } catch (error) {
      console.error("북마크 추가 실패:", error);
      alert("Failed to add bookmark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-14 h-14 text-2xl">+</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL *
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title (optional)
            </label>
            <Input
              id="title"
              placeholder="Will be fetched automatically"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-2">
              Memo (optional)
            </label>
            <Textarea
              id="memo"
              placeholder="Add a note for this bookmark"
              value={formData.memo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, memo: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="folder" className="block text-sm font-medium mb-2">
              Folder (optional)
            </label>
            <select
              id="folder"
              value={formData.folder_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, folder_id: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (optional)
            </label>
            <TagInput
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder="Enter tags"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.url.trim()}
              className="flex-1"
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

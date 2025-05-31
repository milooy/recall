"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFolder } from "@/lib/folders";
import { Plus } from "lucide-react";

interface FolderManagerProps {
  onFolderCreated: () => void;
}

export const FolderManager = ({ onFolderCreated }: FolderManagerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setLoading(true);
    try {
      await createFolder(folderName.trim());
      setFolderName("");
      setOpen(false);
      onFolderCreated();
    } catch (error) {
      console.error("폴더 생성 실패:", error);
      alert("폴더 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full">
          <Plus className="w-4 h-4 mr-1" />
          Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 폴더 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="folderName"
              className="block text-sm font-medium mb-2"
            >
              폴더 이름
            </label>
            <Input
              id="folderName"
              placeholder="폴더 이름을 입력하세요"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1"
            >
              {loading ? "생성 중..." : "생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

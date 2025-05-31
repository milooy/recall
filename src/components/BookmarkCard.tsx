"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/supabase";
import { updateLastClicked, deleteBookmark } from "@/lib/bookmarks";
import { Trash2, Edit, Globe } from "lucide-react";
import { HighlightText } from "@/components/HighlightText";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"] & {
  bookmark_tags?: {
    tags: {
      id: string;
      name: string;
    };
  }[];
};

interface BookmarkCardProps {
  bookmark: Bookmark;
  onBookmarkDeleted: () => void;
  onBookmarkEdit?: (bookmark: Bookmark) => void;
  searchQuery?: string;
}

export const BookmarkCard = ({
  bookmark,
  onBookmarkDeleted,
  onBookmarkEdit,
  searchQuery = "",
}: BookmarkCardProps) => {
  const handleClick = async () => {
    try {
      await updateLastClicked(bookmark.id);
      window.open(bookmark.url, "_blank");
    } catch (error) {
      console.error("클릭 업데이트 실패:", error);
      window.open(bookmark.url, "_blank");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("이 북마크를 삭제하시겠습니까?")) return;

    try {
      await deleteBookmark(bookmark.id);
      onBookmarkDeleted();
    } catch (error) {
      console.error("북마크 삭제 실패:", error);
      alert("북마크 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "1D";
    } else if (diffInDays < 7) {
      return `${diffInDays}D`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}W`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months}M`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years}Y`;
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="group flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
      {/* 파비콘 */}
      <div className="flex-shrink-0">
        {bookmark.meta_image ? (
          <div className="relative w-4 h-4 rounded overflow-hidden">
            <Image
              src={bookmark.meta_image}
              alt=""
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <Globe className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* 제목과 URL */}
      <div className="flex-1 min-w-0" onClick={handleClick}>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate text-sm">
            <HighlightText text={bookmark.title} searchQuery={searchQuery} />
          </h3>
          <span className="text-xs text-gray-400 truncate">
            {getDomain(bookmark.url)}
          </span>
        </div>
        {bookmark.description && (
          <p className="text-xs text-gray-500 line-clamp-2 max-w-2xl">
            <HighlightText
              text={bookmark.description}
              searchQuery={searchQuery}
            />
          </p>
        )}
      </div>

      {/* 생성일 */}
      <div className="flex-shrink-0 text-xs text-gray-500">
        {formatDate(bookmark.created_at)}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onBookmarkEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkEdit(bookmark);
            }}
            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

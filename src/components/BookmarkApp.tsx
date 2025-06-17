"use client";

import { AddBookmarkDialog } from "@/components/AddBookmarkDialog";
import { BookmarkCard } from "@/components/BookmarkCard";
import { EditBookmarkDialog } from "@/components/EditBookmarkDialog";
import { FolderManager } from "@/components/FolderManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBookmarks } from "@/lib/bookmarks";
import { getFolders } from "@/lib/folders";
import { Database } from "@/lib/supabase";
import { useEffect, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import { BookmarkSkeleton } from "./BookmarkSkeleton";
import { BookmarkSort, BookmarkSortDropdown } from "./BookmarkSortDropdown";
import Image from "next/image";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"] & {
  bookmark_tags?: {
    tags: {
      id: string;
      name: string;
    };
  }[];
};
type Folder = Database["public"]["Tables"]["folders"]["Row"];

export const BookmarkApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [selectedFolderId, setSelectedFolderId] = useState<
    string | undefined
  >();
  const [sortBy, setSortBy] = useState<BookmarkSort>("recent");
  const [loading, setLoading] = useState(true);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookmarksData, foldersData] = await Promise.all([
        getBookmarks(),
        getFolders(),
      ]);
      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBookmarks = bookmarks
    .filter((bookmark) => {
      // 검색어 필터링
      const matchesSearch =
        !searchQuery ||
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bookmark.memo &&
          bookmark.memo.toLowerCase().includes(searchQuery.toLowerCase()));

      // 폴더 필터링
      const matchesFolder =
        !selectedFolderId || bookmark.folder_id === selectedFolderId;

      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.last_clicked_at).getTime() -
            new Date(a.last_clicked_at).getTime()
          );
        case "created":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileDropdown />
      <header className="flex flex-col items-center justify-center pt-16">
        <Image
          src="/recall-circle.png"
          alt="Recall Logo"
          width={64}
          height={64}
          className="mb-2"
          priority
        />
        <h1 className="text-2xl text-gray-900">
          Sites to <strong>recall</strong>
        </h1>
        <div className="mt-8 mb-4 w-full px-4">
          <Input
            autoFocus
            type="text"
            placeholder="Add link or search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl mx-auto text-lg py-2"
          />
        </div>

        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedFolderId ? "outline" : "default"}
              className="rounded-full"
              onClick={() => setSelectedFolderId(undefined)}
            >
              전체
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder.id}
                size="sm"
                variant={selectedFolderId === folder.id ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedFolderId(folder.id)}
              >
                {folder.name}
              </Button>
            ))}
            <FolderManager onFolderCreated={loadData} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <BookmarkSortDropdown value={sortBy} onChange={setSortBy} />
        </div>
        <div className="mb-8">
          {loading ? (
            <BookmarkSkeleton />
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "아직 북마크가 없습니다. 첫 번째 북마크를 추가해보세요!"}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onBookmarkDeleted={loadData}
                  onBookmarkEdit={setEditingBookmark}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>

        {/* 북마크 추가 버튼 */}
        <div className="fixed bottom-8 right-8">
          <AddBookmarkDialog
            onBookmarkAdded={loadData}
            selectedFolderId={selectedFolderId}
          />
        </div>

        {/* 북마크 편집 다이얼로그 */}
        <EditBookmarkDialog
          bookmark={editingBookmark}
          open={!!editingBookmark}
          onOpenChange={(open) => !open && setEditingBookmark(null)}
          onBookmarkUpdated={loadData}
        />
      </main>
    </div>
  );
};

import React from "react";
import { TagManager } from "./TagManager";
import { Tag } from "@/lib/tags";
import { Button } from "./ui/button";

export default function Tags({
  tags,
  selectedTagIds,
  setSelectedTagIds,
  loadData,
}: {
  tags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  loadData: () => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <Button
          key={tag.id}
          variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
          className="rounded-full text-sm"
          onClick={() => {
            if (selectedTagIds.includes(tag.id)) {
              setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id));
            } else {
              setSelectedTagIds([...selectedTagIds, tag.id]);
            }
          }}
        >
          {tag.name}
        </Button>
      ))}
      {selectedTagIds.length > 0 && (
        <Button
          variant="ghost"
          className="rounded-full text-sm text-gray-500"
          onClick={() => setSelectedTagIds([])}
        >
          모든 태그 해제
        </Button>
      )}
      <TagManager onTagsUpdated={loadData} />
    </div>
  );
}

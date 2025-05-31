"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownWideNarrow } from "lucide-react";
export type BookmarkSort = "recent" | "created" | "title";

const mapSortToLabel = {
  recent: "Recent opened",
  created: "Created",
  title: "Title",
};

export function BookmarkSortDropdown({
  onChange,
  value,
}: {
  value: "recent" | "created" | "title";
  onChange: (sort: "recent" | "created" | "title") => void;
}) {
  const [position, setPosition] = React.useState("bottom");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <ArrowDownWideNarrow />
          {mapSortToLabel[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem
            onClick={() => onChange("recent")}
            value="recent"
          >
            {mapSortToLabel.recent}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onClick={() => onChange("created")}
            value="created"
          >
            {mapSortToLabel.created}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onClick={() => onChange("title")}
            value="title"
          >
            {mapSortToLabel.title}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

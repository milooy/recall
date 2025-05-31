import { supabase } from "./supabase";
import { Database } from "./supabase";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

// 태그 생성 (중복 방지)
export const createTag = async (name: string): Promise<Tag> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const tagName = name.trim().toLowerCase();

  // 기존 태그 확인
  const { data: existingTag } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .eq("name", tagName)
    .single();

  if (existingTag) {
    return existingTag;
  }

  // 새 태그 생성
  const tagData: TagInsert = {
    user_id: user.id,
    name: tagName,
  };

  const { data, error } = await supabase
    .from("tags")
    .insert(tagData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 태그 목록 조회
export const getTags = async (): Promise<Tag[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

// 북마크에 태그 추가
export const addTagToBookmark = async (bookmarkId: string, tagId: string) => {
  const { error } = await supabase
    .from("bookmark_tags")
    .insert({ bookmark_id: bookmarkId, tag_id: tagId });

  if (error && error.code !== "23505") {
    // 중복 키 에러 무시
    throw error;
  }
};

// 북마크에서 태그 제거
export const removeTagFromBookmark = async (
  bookmarkId: string,
  tagId: string
) => {
  const { error } = await supabase
    .from("bookmark_tags")
    .delete()
    .eq("bookmark_id", bookmarkId)
    .eq("tag_id", tagId);

  if (error) throw error;
};

// 북마크의 태그 목록 조회
export const getBookmarkTags = async (bookmarkId: string): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from("bookmark_tags")
    .select(
      `
      tags (
        id,
        name,
        user_id,
        created_at
      )
    `
    )
    .eq("bookmark_id", bookmarkId);

  if (error) throw error;

  const result: Tag[] = [];
  if (data) {
    for (const item of data) {
      const tagData = (item as unknown as { tags: Tag }).tags;
      if (tagData) {
        result.push(tagData);
      }
    }
  }
  return result;
};

// 태그별 북마크 개수 조회
export const getTagCounts = async (): Promise<Record<string, number>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bookmark_tags")
    .select(
      `
      tag_id,
      bookmarks!inner (
        user_id
      )
    `
    )
    .eq("bookmarks.user_id", user.id);

  if (error) throw error;

  const counts: Record<string, number> = {};
  data?.forEach((item) => {
    counts[item.tag_id] = (counts[item.tag_id] || 0) + 1;
  });

  return counts;
};

// 태그 업데이트
export const updateTag = async (id: string, name: string): Promise<Tag> => {
  const { data, error } = await supabase
    .from("tags")
    .update({ name: name.trim().toLowerCase() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 태그 삭제
export const deleteTag = async (id: string) => {
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) throw error;
};

// 태그 이름으로 검색 (자동완성용)
export const searchTags = async (query: string): Promise<Tag[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .ilike("name", `%${query.toLowerCase()}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (error) throw error;
  return data || [];
};

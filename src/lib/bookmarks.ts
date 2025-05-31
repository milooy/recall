import { Database, supabase } from './supabase'

type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']
type BookmarkUpdate = Database['public']['Tables']['bookmarks']['Update']

// URL에서 메타데이터 추출
export const fetchMetadata = async (url: string) => {
  try {
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
    if (!response.ok) throw new Error('Failed to fetch metadata')
    return await response.json()
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {
      title: url,
      description: '',
      image: null
    }
  }
}

// 북마크 생성
export const createBookmark = async (data: {
  url: string
  title?: string
  description?: string
  memo?: string
  folder_id?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // 메타데이터 자동 추출
  let metadata = { title: data.url, description: '', image: null }
  if (!data.title) {
    metadata = await fetchMetadata(data.url)
  }

  const bookmarkData: BookmarkInsert = {
    user_id: user.id,
    url: data.url,
    title: data.title || metadata.title,
    description: data.description || metadata.description,
    memo: data.memo || null,
    folder_id: data.folder_id || null,
    meta_image: metadata.image,
    last_clicked_at: new Date().toISOString(),
  }

  const { data: bookmark, error } = await supabase
    .from('bookmarks')
    .insert(bookmarkData)
    .select()
    .single()

  if (error) throw error
  return bookmark
}

// 북마크 목록 조회 (태그 포함)
export const getBookmarks = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      bookmark_tags (
        tags (
          id,
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('last_clicked_at', { ascending: false })

  if (error) throw error
  return data || []
}

// 북마크 업데이트
export const updateBookmark = async (id: string, updates: BookmarkUpdate) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 북마크 삭제
export const deleteBookmark = async (id: string) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 북마크 클릭 시 last_clicked_at 업데이트
export const updateLastClicked = async (id: string) => {
  const { error } = await supabase
    .from('bookmarks')
    .update({ last_clicked_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
} 
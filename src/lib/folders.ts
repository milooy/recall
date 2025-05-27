import { supabase } from './supabase'
import { Database } from './supabase'

type Folder = Database['public']['Tables']['folders']['Row']
type FolderInsert = Database['public']['Tables']['folders']['Insert']

// 폴더 생성
export const createFolder = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const folderData: FolderInsert = {
    user_id: user.id,
    name: name.trim(),
  }

  const { data, error } = await supabase
    .from('folders')
    .insert(folderData)
    .select()
    .single()

  if (error) throw error
  return data
}

// 폴더 목록 조회
export const getFolders = async (): Promise<Folder[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// 폴더 삭제
export const deleteFolder = async (id: string) => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 폴더 이름 변경
export const updateFolder = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('folders')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
} 
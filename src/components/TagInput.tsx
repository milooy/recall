'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { searchTags, createTag } from '@/lib/tags'
import { Database } from '@/lib/supabase'

type Tag = Database['public']['Tables']['tags']['Row']

interface TagInputProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  placeholder?: string
}

export const TagInput = ({ selectedTags, onTagsChange, placeholder = "태그 입력..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 태그 검색 (디바운스)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.trim()) {
        try {
          const results = await searchTags(inputValue)
          // 이미 선택된 태그 제외
          const filtered = results.filter(tag => 
            !selectedTags.some(selected => selected.id === tag.id)
          )
          setSuggestions(filtered)
          setShowSuggestions(true)
        } catch (error) {
          console.error('태그 검색 실패:', error)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, selectedTags])

  // 태그 추가
  const addTag = async (tagName: string) => {
    try {
      const tag = await createTag(tagName)
      if (!selectedTags.some(selected => selected.id === tag.id)) {
        onTagsChange([...selectedTags, tag])
      }
      setInputValue('')
      setShowSuggestions(false)
    } catch (error) {
      console.error('태그 추가 실패:', error)
    }
  }

  // 태그 제거
  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // 입력값이 없을 때 백스페이스로 마지막 태그 제거
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
            {tag.name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        onFocus={() => inputValue && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* 자동완성 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map(tag => (
            <button
              key={tag.id}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => addTag(tag.name)}
            >
              {tag.name}
            </button>
          ))}
          {inputValue && !suggestions.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-blue-600"
              onClick={() => addTag(inputValue)}
            >
              &quot;{inputValue}&quot; 새 태그 만들기
            </button>
          )}
        </div>
      )}
    </div>
  )
} 
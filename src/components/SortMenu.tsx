'use client'

import { ArrowDown01, ArrowDownAZ, ArrowDownWideNarrow, ArrowUp01, ArrowUpAZ, ArrowUpWideNarrow } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortKey = 'date-desc' | 'date-asc' | 'size-asc' | 'size-desc' | 'title-asc' | 'title-desc'

const OPTIONS: { key: SortKey; label: string; icon: typeof ArrowDown01 }[] = [
  { key: 'date-desc', label: 'Date Taken (Newest First)', icon: ArrowDownWideNarrow },
  { key: 'date-asc', label: 'Date Taken (Oldest First)', icon: ArrowUpWideNarrow },
  { key: 'size-asc', label: 'File Size (Ascending)', icon: ArrowUp01 },
  { key: 'size-desc', label: 'File Size (Descending)', icon: ArrowDown01 },
  { key: 'title-asc', label: 'Title (Ascending)', icon: ArrowUpAZ },
  { key: 'title-desc', label: 'Title (Descending)', icon: ArrowDownAZ },
]

export default function SortMenu({ value, onChange }: { value: SortKey; onChange: (key: SortKey) => void }) {
  return (
    <div className="w-[min(92vw,270px)] overflow-hidden rounded-xl border border-edge bg-stage py-2 shadow-2xl">
      <p className="display px-4 pt-1.5 pb-2 text-base text-paper">Sort By</p>
      {OPTIONS.map(({ key, label, icon: Icon }) => {
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors',
              active ? 'bg-back/15 text-back' : 'text-paper hover:bg-riser',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

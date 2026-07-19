import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import { searchStaticEntries } from '@/data/searchIndex'
import { searchProducts, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type Result =
  | { kind: 'entry'; key: string; title: string; subtitle: string; to: string; group: string }
  | { kind: 'product'; key: string; title: string; subtitle: string; to: string; group: string; image: string | null }

const DEBOUNCE_MS = 250

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const trimmed = query.trim()

  // Static matches are instant — no waiting on the network.
  const staticResults = useMemo<Result[]>(
    () =>
      searchStaticEntries(trimmed).map((entry) => ({
        kind: 'entry' as const,
        key: entry.to,
        title: entry.title,
        subtitle: entry.description,
        to: entry.to,
        group: entry.group,
      })),
    [trimmed],
  )

  const productResults = useMemo<Result[]>(
    () =>
      products.map((product) => ({
        kind: 'product' as const,
        key: product.id,
        title: product.title,
        subtitle: formatPrice(product.price),
        to: `/online-modules/${product.handle}`,
        group: 'Products',
        image: product.featuredImage?.url ?? null,
      })),
    [products],
  )

  const results = useMemo(() => [...staticResults, ...productResults], [staticResults, productResults])

  // Group results while preserving order, so headings render in one pass.
  const grouped = useMemo(() => {
    const out: { group: string; items: Result[] }[] = []
    for (const result of results) {
      const last = out[out.length - 1]
      if (last?.group === result.group) last.items.push(result)
      else out.push({ group: result.group, items: [result] })
    }
    return out
  }, [results])

  // Focus the input once the open transition has started.
  useEffect(() => {
    if (!isOpen) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(id)
  }, [isOpen])

  // Reset everything on close so reopening starts clean.
  useEffect(() => {
    if (isOpen) return
    setQuery('')
    setProducts([])
    setLoadingProducts(false)
    setActiveIndex(0)
  }, [isOpen])

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  // Debounced live product lookup. `cancelled` guards against a slow response
  // from an earlier keystroke overwriting a newer one.
  useEffect(() => {
    if (!isOpen || trimmed.length < 2) {
      setProducts([])
      setLoadingProducts(false)
      return
    }

    let cancelled = false
    setLoadingProducts(true)

    const id = window.setTimeout(() => {
      searchProducts(trimmed)
        .then((found) => { if (!cancelled) setProducts(found) })
        .finally(() => { if (!cancelled) setLoadingProducts(false) })
    }, DEBOUNCE_MS)

    return () => { cancelled = true; window.clearTimeout(id) }
  }, [trimmed, isOpen])

  useEffect(() => { setActiveIndex(0) }, [trimmed])

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (!results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = results[activeIndex]
      if (target) go(target.to)
    }
  }

  // Keep the keyboard-selected row inside the scroll viewport.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const showEmpty = trimmed.length >= 2 && !results.length && !loadingProducts

  let flatIndex = -1

  return (
    <div
      className={[
        'fixed inset-0 z-[60] lg:flex lg:items-start lg:justify-center lg:pt-[12vh]',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#3d3028]/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      {/* Panel — full-screen sheet on mobile, floating card on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onKeyDown={handleKeyDown}
        className={[
          'relative flex flex-col bg-brand-light',
          'h-[100dvh] w-full',
          'lg:h-auto lg:max-h-[70vh] lg:w-full lg:max-w-2xl lg:rounded-2xl lg:border lg:border-brand-border',
          'lg:shadow-[0_16px_48px_rgba(130,112,100,0.22)] overflow-hidden',
          'transition-all duration-300 ease-out',
        ].join(' ')}
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.98)',
        }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-brand-border flex-none">
          <Search size={20} className="text-[#a0948a] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, courses, and products…"
            aria-label="Search"
            className="flex-1 min-w-0 bg-transparent text-base text-[#3d3028] placeholder:text-[#a0948a] outline-none"
          />
          {loadingProducts && <Loader2 size={16} className="text-[#a0948a] animate-spin shrink-0" />}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 -mr-2 text-[#5a5047] hover:text-brand active:opacity-60 transition-colors duration-200 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {trimmed.length < 2 && (
            <p className="px-4 sm:px-6 py-8 text-sm text-[#a0948a]">
              Start typing to search the site.
            </p>
          )}

          {showEmpty && (
            <p className="px-4 sm:px-6 py-8 text-sm text-[#5a5047]">
              No results for “{trimmed}”. Try a shorter or different word.
            </p>
          )}

          {grouped.map(({ group, items }) => (
            <div key={group} className="py-2">
              <p className="px-4 sm:px-6 py-2 text-[0.6rem] tracking-[0.28em] uppercase text-[#a0948a] font-medium">
                {group}
              </p>
              {items.map((result) => {
                flatIndex += 1
                const isActive = flatIndex === activeIndex
                const index = flatIndex
                return (
                  <button
                    key={result.key}
                    data-active={isActive}
                    onClick={() => go(result.to)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={[
                      'w-full text-left px-4 sm:px-6 py-3 flex items-center gap-3 transition-colors duration-150',
                      isActive ? 'bg-white' : 'hover:bg-white/60',
                    ].join(' ')}
                  >
                    {result.kind === 'product' && (
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#f6f2ec] shrink-0">
                        {result.image && (
                          <img
                            src={result.image}
                            alt=""
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#3d3028] leading-snug truncate">{result.title}</p>
                      <p className="text-xs text-[#5a5047] leading-snug truncate">{result.subtitle}</p>
                    </div>
                    <ArrowRight
                      size={14}
                      className={`shrink-0 transition-opacity duration-150 ${isActive ? 'text-brand opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Keyboard hint — desktop only, where a keyboard actually exists */}
        {results.length > 0 && (
          <div className="hidden lg:flex items-center gap-4 px-6 h-10 border-t border-brand-border text-[0.65rem] text-[#a0948a] flex-none">
            <span>↑↓ to navigate</span>
            <span>↵ to open</span>
            <span>esc to close</span>
          </div>
        )}
      </div>
    </div>
  )
}

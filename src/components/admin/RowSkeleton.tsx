export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-[#f1ece5] last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 w-24 bg-[#ece7e0] rounded-full animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export function MobileRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#ece7e0] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-[#ece7e0] rounded-full animate-pulse" />
        <div className="h-2.5 w-40 bg-[#f1ece5] rounded-full animate-pulse" />
      </div>
    </div>
  )
}

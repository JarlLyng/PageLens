// A static visual replica of the extension popup, used as the hero product shot.
const SUBSCORES = [
  ['Carbon', 82],
  ['Weight', 71],
  ['Hosting', 100],
  ['Best practices', 90],
] as const

export function PopupMock() {
  return (
    <div className="w-[340px] shrink-0 rounded-ij-lg border border-ij-border bg-ij-bg p-4 shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-ij-sm bg-ij-primary font-bold text-ij-on-primary">
          P
        </span>
        <span className="text-sm font-semibold">PageLens</span>
      </div>

      <p className="mb-3 truncate text-xs text-ij-text-secondary">example.com</p>

      {/* Eco score */}
      <div className="mb-3 flex flex-col gap-3 rounded-ij-md border border-ij-border p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-ij-md bg-eco-a text-3xl font-bold text-white">
            A
          </div>
          <div>
            <div className="text-2xl font-semibold">
              86<span className="text-base font-normal text-ij-text-tertiary">/100</span>
            </div>
            <div className="text-xs text-ij-text-secondary">Eco Score</div>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5">
          {SUBSCORES.map(([label, value]) => (
            <li key={label} className="flex items-center gap-2 text-xs">
              <span className="w-24 text-ij-text-secondary">{label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ij-muted">
                <span
                  className="block h-full rounded-full bg-ij-primary"
                  style={{ width: `${value}%` }}
                />
              </span>
              <span className="w-7 text-right text-ij-text-secondary">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Carbon */}
      <div className="mb-3 flex gap-3">
        <div className="flex-1 rounded-ij-md border border-ij-border p-3">
          <div className="text-xl font-semibold">0.24 g</div>
          <div className="text-xs text-ij-text-secondary">CO₂ per view</div>
        </div>
        <div className="flex-1 rounded-ij-md border border-ij-border p-3">
          <div className="text-xl font-semibold">28.8 kg</div>
          <div className="text-xs text-ij-text-secondary">CO₂ per year</div>
        </div>
      </div>

      {/* Hosting */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span>✅</span>
        <span className="font-medium text-ij-success">Green hosted</span>
      </div>

      {/* Weight bar */}
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold">Page weight</span>
        <span className="text-sm font-semibold">1.2 MB</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ij-muted">
        <span className="bg-amber-500" style={{ width: '42%' }} />
        <span className="bg-emerald-500" style={{ width: '28%' }} />
        <span className="bg-violet-500" style={{ width: '15%' }} />
        <span className="bg-sky-500" style={{ width: '9%' }} />
        <span className="bg-pink-500" style={{ width: '6%' }} />
      </div>

      {/* One recommendation */}
      <div className="mt-3 flex items-center gap-2 rounded-ij-md border border-ij-border p-2.5 text-sm">
        <span className="rounded bg-eco-e/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-eco-e">
          High
        </span>
        <span className="flex-1 font-medium">Compress oversized images</span>
        <span className="text-xs text-ij-text-tertiary">~420 KB</span>
      </div>
    </div>
  )
}

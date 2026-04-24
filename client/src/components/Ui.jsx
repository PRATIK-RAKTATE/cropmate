export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200/80 px-5 py-6 md:flex-row md:items-end md:justify-between md:px-8">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 font-['Fraunces'] text-3xl text-stone-950 md:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-stone-600 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}

export function Card({ children, className = '' }) {
  const hasBg = className.includes('bg-')
  return (
    <div
      className={`rounded-[1.75rem] border border-stone-200 ${
        !hasBg ? 'bg-white' : ''
      } p-5 shadow-[0_12px_40px_rgba(120,113,108,0.12)] ${className}`}
    >
      {children}
    </div>
  )
}

export function Label({ children }) {
  return <label className="mb-2 block text-sm font-semibold text-stone-700">{children}</label>
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-500 focus:bg-white ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-500 focus:bg-white ${props.className || ''}`}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-500 focus:bg-white ${props.className || ''}`}
    />
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-stone-950 text-white hover:bg-stone-800',
    secondary: 'bg-lime-300 text-stone-950 hover:bg-lime-200',
    subtle: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
  }

  return (
    <button
      {...props}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  )
}

export function Metric({ label, value, helper }) {
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-stone-950">{value}</p>
      {helper ? <p className="mt-2 text-sm text-stone-500">{helper}</p> : null}
    </div>
  )
}

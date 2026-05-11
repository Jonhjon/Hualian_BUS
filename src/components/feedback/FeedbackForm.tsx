'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Send, Star } from 'lucide-react'
import { feedbackSchema, type FeedbackInput } from '@/lib/validators/feedback.schema'
import { Textarea } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const MAX_COMMENT = 500
const RATING_LABEL: Record<number, string> = {
  1: '非常不滿意',
  2: '不滿意',
  3: '普通',
  4: '滿意',
  5: '非常滿意',
}

interface Props {
  bookingId: number
  onSuccess?: () => void
}

export function FeedbackForm({ bookingId, onSuccess }: Props) {
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const submit = useMutation({
    mutationFn: (data: FeedbackInput) =>
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async r => {
        const json = await r.json()
        if (!r.ok) throw new Error(json.error ?? '送出失敗')
        return json
      }),
    onSuccess,
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { bookingId, rating: 5 },
  })

  const selectedRating = watch('rating') ?? 5
  const displayRating = hoveredRating ?? selectedRating

  if (submit.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-lg border border-success/30 bg-success-soft px-6 py-8 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success" aria-hidden="true">
          <CheckCircle2 size={32} />
        </span>
        <p className="text-xl font-bold text-success">感謝您的回饋！</p>
        <p className="text-sm text-ink-soft">您的意見將協助我們持續改善服務品質</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(data => submit.mutate(data))} noValidate className="flex flex-col gap-6">
      <input type="hidden" {...register('bookingId', { valueAsNumber: true })} />

      <fieldset className="rounded-lg border border-border bg-surface p-5">
        <legend className="px-2 text-sm font-bold text-ink">服務評分</legend>
        <div className="flex items-center justify-center gap-1.5 py-3" role="radiogroup" aria-label="評分">
          {[1, 2, 3, 4, 5].map(n => {
            const isActive = n <= displayRating
            return (
              <label
                key={n}
                className="cursor-pointer p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(n)}
                onMouseLeave={() => setHoveredRating(null)}
              >
                <input
                  type="radio"
                  value={n}
                  {...register('rating', { valueAsNumber: true })}
                  className="sr-only"
                  aria-label={`${n} 星`}
                />
                <Star
                  size={36}
                  strokeWidth={1.6}
                  className={cn(
                    'transition-colors',
                    isActive ? 'fill-accent-500 text-accent-500' : 'fill-none text-border-strong',
                  )}
                  aria-hidden="true"
                />
              </label>
            )
          })}
        </div>
        <p aria-live="polite" className="text-center text-sm font-semibold text-ink-soft">
          {displayRating} 星 · {RATING_LABEL[displayRating]}
        </p>
        {errors.rating && (
          <p role="alert" className="mt-2 text-center text-sm font-medium text-danger">
            {errors.rating.message}
          </p>
        )}
      </fieldset>

      <FormField label="意見（選填）" htmlFor="comment" hint={`最多 ${MAX_COMMENT} 字`} error={errors.comment?.message}>
        <Textarea
          id="comment"
          rows={5}
          maxLength={MAX_COMMENT}
          aria-describedby="comment-count"
          invalid={!!errors.comment}
          {...register('comment')}
          onChange={e => {
            setComment(e.target.value)
            setValue('comment', e.target.value)
          }}
          placeholder="告訴我們您搭乘的感受、司機服務、車輛狀況或任何改善建議..."
        />
        <p id="comment-count" aria-live="polite" className="text-right text-xs text-ink-muted">
          {comment.length} / {MAX_COMMENT}
        </p>
      </FormField>

      {submit.error && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {(submit.error as Error).message}
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={submit.isPending}
        leftIcon={<Send size={18} aria-hidden="true" />}
      >
        {submit.isPending ? '送出中...' : '送出回饋'}
      </Button>
    </form>
  )
}

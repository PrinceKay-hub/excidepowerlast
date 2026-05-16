import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Review, subscribeToReviews, submitReview } from "@/lib/reviews";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";

const reviewSchema = z.object({
  author: z.string().min(2, "Name must be at least 2 characters"),
  body: z.string().min(10, "Review must be at least 10 characters"),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const active = readonly ? value : hovered || value;

  return (
    <div className="flex items-center gap-0.5" data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          data-testid={readonly ? undefined : `star-${n}`}
        >
          <Star
            className={`${sz} transition-colors ${
              n <= active
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(ts: Review["createdAt"]): string {
  if (!ts) return "Just now";
  const d =
    typeof ts === "object" && "toDate" in ts
      ? (ts as { toDate: () => Date }).toDate()
      : new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border bg-card p-5 flex flex-col gap-3"
      data-testid={`review-card-${review.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
              {review.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm">{review.author}</p>
              <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
            </div>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
        {review.body}
      </p>
    </motion.div>
  );
}

function AverageBar({ count, star, total }: { count: number; star: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-muted-foreground">{star}</span>
      <Star className="h-3 w-3 fill-primary text-primary shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-none overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full bg-primary"
        />
      </div>
      <span className="w-4 text-muted-foreground">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success">("idle");
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { author: "", body: "" },
  });

  useEffect(() => {
    const unsub = subscribeToReviews(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });
    return unsub;
  }, [productId]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  async function onSubmit(values: ReviewFormValues) {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setSubmitStatus("loading");
    await submitReview({ productId, author: values.author, rating, body: values.body });
    setSubmitStatus("success");
    form.reset();
    setRating(0);
    setTimeout(() => {
      setSubmitStatus("idle");
      setShowForm(false);
    }, 2000);
  }

  return (
    <div className="mt-16 border-t border-border pt-10" data-testid="review-section">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Customer Reviews</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {reviews.length === 0
              ? "No reviews yet — be the first."
              : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          className="uppercase font-bold rounded-none gap-2"
          onClick={() => setShowForm((v) => !v)}
          data-testid="button-write-review"
        >
          <MessageSquare className="h-4 w-4" />
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-10 border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:border-border sm:pr-8 shrink-0">
            <p className="text-5xl font-black text-primary">{avg.toFixed(1)}</p>
            <StarRating value={Math.round(avg)} readonly size="md" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
            {distribution.map(({ star, count }) => (
              <AverageBar key={star} star={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="border border-primary/30 bg-card p-6">
              <h3 className="font-black uppercase tracking-tight mb-4">Leave Your Review</h3>

              {submitStatus === "success" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center" data-testid="review-success">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                  <p className="font-bold">Review submitted — thank you!</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Your Rating</p>
                      <StarRating value={rating} onChange={(v) => { setRating(v); setRatingError(false); }} size="lg" />
                      {ratingError && (
                        <p className="text-destructive text-xs mt-1" data-testid="text-rating-error">
                          Please select a star rating.
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Mike T."
                              className="rounded-none"
                              data-testid="input-review-author"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What did you think of this battery? How does it perform?"
                              className="rounded-none min-h-25"
                              data-testid="input-review-body"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="uppercase font-bold rounded-none w-full sm:w-auto"
                      disabled={submitStatus === "loading"}
                      data-testid="button-submit-review"
                    >
                      {submitStatus === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2 border border-dashed border-border">
          <Star className="h-8 w-8 opacity-20" />
          <p className="text-sm">No reviews yet. Share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

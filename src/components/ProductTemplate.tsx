"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PricedProduct } from "@/lib/products";
import { cld } from "@/lib/images";
import styles from "@/app/product/[id]/page.module.css";
import PaymentSelector from "@/components/PaymentSelector";
import ProductImage from "@/components/ProductImage";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  timestamp: string;
};

type Props = {
  product: PricedProduct;
};

export default function ProductTemplate({ product }: Props) {
  const images = useMemo(() => {
    const list = [product.thumbnail, ...(product.images || [])].filter(Boolean);
    const seen = new Set<string>();
    const unique = [];
    for (const url of list) {
      if (!seen.has(url)) {
        seen.add(url);
        unique.push(url);
      }
    }
    return unique.length > 0 ? unique : [product.thumbnail].filter(Boolean);
  }, [product.thumbnail, product.images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("productReviews");
    if (stored) {
      setReviews(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const renderStars = useCallback(
    (value: number) => {
      return Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`${styles.star} ${index < value ? styles.starActive : ""}`}
          onClick={() => setRating(index + 1)}
        >
          ★
        </span>
      ));
    },
    [],
  );

  const availableSizes = useMemo(() => {
    if (!Array.isArray(product.sizes)) return [];
    return product.sizes
      .filter(Boolean)
      .flatMap((size) =>
        String(size)
          .split(/[,;\/\s]+/)
          .map((part) => part.trim())
          .filter(Boolean),
      );
  }, [product.sizes]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const nameWithSize = selectedSize ? `${product.name} (${selectedSize})` : product.name;
  const totalImages = images.length;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const manualScrollRef = useRef(false);
  const skipScrollRef = useRef(false);
  const manualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || totalImages <= 1) return;
    manualScrollRef.current = true;
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    manualTimeoutRef.current = setTimeout(() => {
      manualScrollRef.current = false;
    }, 2000);
    const width = el.clientWidth || el.offsetWidth;
    if (!width) return;
    const targetIndex = Math.min(totalImages - 1, Math.max(0, Math.round(el.scrollLeft / width)));
    if (targetIndex !== activeIndex) {
      skipScrollRef.current = true;
      setActiveIndex(targetIndex);
    }
  }, [activeIndex, totalImages]);

  useEffect(() => {
    if (totalImages <= 1) return;
    const interval = setInterval(() => {
      if (manualScrollRef.current) return;
      setActiveIndex((current) => (current + 1) % totalImages);
    }, 4500);
    return () => clearInterval(interval);
  }, [totalImages]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    const width = el.clientWidth || el.offsetWidth;
    if (!width) return;
    el.scrollTo({ left: width * activeIndex, behavior: "smooth" });
  }, [activeIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => () => {
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
  }, []);

  const handleCloseCard = useCallback(() => setCardOpen(false), []);

  const handleBuy = useCallback(() => {
    try {
      const payload = {
        id: product.id,
        name: nameWithSize,
        price: product.price,
        qty: 1,
        imageUrl: product.thumbnail,
      };
      window.localStorage.setItem("checkoutPrefill", JSON.stringify(payload));
    } catch {}
    setCardOpen(true);
  }, [nameWithSize, product.id, product.price, product.thumbnail]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem("customerName") as HTMLInputElement).value;
    const comment = (form.elements.namedItem("reviewComment") as HTMLTextAreaElement).value;
    if (!name || !comment || rating === 0) {
      setToast("Please provide your name, comment, and rating.");
      return;
    }
    const newReview: Review = {
      id: Date.now().toString(),
      customer_name: name,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem("productReviews", JSON.stringify(updated));
    form.reset();
    setRating(0);
    setToast("Review submitted successfully!");
  };

  return (
    <div className={styles.pageContainer}>
        <div className={styles.productSection}>
        <div className={styles.imageGallery}>
          <div className={styles.imageCard}>
            <div className={styles.mainImage}>
              <div className={styles.imageFrame}>
                <div className={styles.imageScroller} ref={scrollerRef}>
                  {images.map((src, idx) => (
                    <div key={`${src}-${idx}`} className={styles.imageSlide}>
                      <ProductImage src={cld(src, "detail")} alt={product.name} />
                    </div>
                  ))}
                </div>
                {totalImages > 1 && (
                  <div className={styles.dotRow}>
                    {images.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        className={`${styles.dot} ${activeIndex === idx ? styles.dotActive : ""}`}
                        type="button"
                        onClick={() => {
                          skipScrollRef.current = false;
                          setActiveIndex(idx);
                        }}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
                <div className={styles.imageDots} aria-hidden="true">
                  {images.map((_, idx) => (
                    <span
                      key={`badge-${idx}`}
                      className={idx === activeIndex ? styles.imageDotActive : styles.imageDot}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>${product.price.toFixed(2)}</h1>
              <h2 className={styles.productTitle}>{product.name}</h2>
            </div>
            {availableSizes.length > 0 && (
            <div className={styles.sizePanel}>
              <div className={styles.sizePanelHeading}>
                <span className={styles.availableLabel}>Pick Your Size</span>
                {selectedSize && <span className={styles.sizeSelectedNote}>Selected: {selectedSize}</span>}
              </div>
              <div className={styles.sizeGrid}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizeChip} ${selectedSize === size ? styles.sizeChipActive : ""}`}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className={styles.productDescription}>{product.description}</p>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${selectedSize ? styles.btnPurple : ""}`}
              type="button"
              onClick={handleBuy}
            >
              Buy now
            </button>
            <button className={`${styles.btn} ${styles.btnAccent} ${selectedSize ? styles.btnPurple : ""}`} type="button">
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div className={styles.feedbackSection}>
        <h2 className={styles.feedbackTitle}>Customer Reviews</h2>
        <div className={styles.feedbackForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="customerName">Your Name</label>
              <input type="text" id="customerName" name="customerName" required placeholder="Enter your name" />
            </div>
            <div className={styles.formGroup}>
              <label>Rating</label>
              <div className={styles.ratingInput}>{renderStars(rating)}</div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="reviewComment">Your Review</label>
              <textarea id="reviewComment" name="reviewComment" required placeholder="Share your experience"></textarea>
            </div>
            <button type="submit" className={`${styles.submitBtn} ${rating === 0 ? styles.submitBtnDisabled : ""}`} disabled={rating === 0}>
              Submit Review
            </button>
          </form>
        </div>
        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>No reviews yet. Be the first to review!</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>{review.customer_name}</span>
                  <span className={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
                <span className={styles.reviewDate}>{new Date(review.timestamp).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {toast && <div className={`${styles.toast} ${styles.toastShow}`}>{toast}</div>}
      {cardOpen && (
        <div className={styles.cardOverlay} role="dialog" aria-modal="true">
          <div className={styles.buyTabCard}>
            <div className={styles.buyTabHeader}>
              <div>
                <h3 className={styles.buyTabTitle}>Complete Your Order</h3>
              </div>
            </div>
            <div className={styles.buyTabSelector}>
              <PaymentSelector amount={product.price} />
            </div>
            <button className={styles.buyTabClose} type="button" aria-label="Close" onClick={handleCloseCard}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

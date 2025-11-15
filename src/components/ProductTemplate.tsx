"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PricedProduct } from "@/lib/products";
import { cld } from "@/lib/images";
import styles from "@/app/product/[id]/page.module.css";
import ProductImage from "@/components/ProductImage";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  timestamp: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  size?: string | null;
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

  const nameWithSize = selectedSize ? `${product.name} (${selectedSize})` : product.name;
  const totalImages = images.length;
  const productImage = product.thumbnail || product.images?.[0];

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

  const handleAddToCart = useCallback(() => {
    if (!product || product.price <= 0) {
      setToast("This product cannot be added to the cart.");
      return;
    }
    const payload: CartItem = {
      id: product.id,
      name: nameWithSize,
      price: product.price,
      qty: 1,
      imageUrl: product.thumbnail,
      size: selectedSize,
    };

    try {
      const raw = window.localStorage.getItem("cart");
      const list: CartItem[] = raw ? JSON.parse(raw) : [];
      const next = [...list];
      const existing = next.find((it) => it.id === payload.id && it.size === payload.size);
      if (existing) {
        existing.qty += 1;
      } else {
        next.push(payload);
      }
      window.localStorage.setItem("cart", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setToast("Added to cart.");
    } catch {
      setToast("Unable to add to cart right now.");
    }
  }, [nameWithSize, product.id, product.price, product.thumbnail, selectedSize]);

  const whatsappPhoneRaw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
  const whatsappPhone = whatsappPhoneRaw ? whatsappPhoneRaw.replace(/\D/g, "") : null;
  const customWhatsAppLink = (process.env.NEXT_PUBLIC_WHATSAPP_LINK || "").trim();
  const baseWhatsAppLink =
    whatsappPhone ? `https://wa.me/${whatsappPhone}` : customWhatsAppLink || "https://wa.me/message/ZC23PRNRWILSN1";

  const formatWhatsAppLinks = useCallback(() => {
    const imageSource = images[activeIndex] || productImage;
    const imageLine = imageSource ? cld(imageSource, "detail") : null;
    const separator = baseWhatsAppLink.includes("?") ? "&" : "?";
    const productName = selectedSize ? `${product.name} (${selectedSize})` : product.name;
    const invoiceLines = [
      "🧾 Order details",
      `Product: ${productName}`,
      `Price: $${product.price.toFixed(2)}`,
      selectedSize ? `Size: ${selectedSize}` : null,
      imageLine ? `Image: ${imageLine}` : null,
      "Quantity: 1",
      "Please send payment instructions at your convenience.",
    ].filter((line): line is string => Boolean(line));
    const message = ["Hi there!", "I'd like to place an order with you:", "", ...invoiceLines].join("\n");
    const encoded = encodeURIComponent(message);
    const desktopUrl = `${baseWhatsAppLink}${separator}text=${encoded}`;
    const mobileUrl = whatsappPhone
      ? `whatsapp://send?phone=${whatsappPhone}&text=${encoded}`
      : desktopUrl;
    return { desktopUrl, mobileUrl };
  }, [
    activeIndex,
    baseWhatsAppLink,
    images,
    product.name,
    product.price,
    productImage,
    selectedSize,
    whatsappPhone,
  ]);

  const sendWhatsApp = useCallback(() => {
    const { desktopUrl, mobileUrl } = formatWhatsAppLinks();
    if (!desktopUrl) {
      setToast("WhatsApp checkout is not configured yet.");
      return;
    }
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
    const isMobile =
      nav?.userAgentData?.mobile === true ||
      /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(nav?.userAgent || "");
    if (isMobile && mobileUrl) {
      window.location.href = mobileUrl;
      return;
    }
    window.open(desktopUrl, "_blank");
  }, [formatWhatsAppLinks]);

  const handleBuy = useCallback(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setToast("Please select a size before checking out via WhatsApp.");
      return;
    }
    sendWhatsApp();
  }, [availableSizes.length, selectedSize, sendWhatsApp]);

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
        <div className={styles.productCard}>
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
            <p className={styles.productDescription}>{product.description}</p>
            {availableSizes.length > 0 && (
              <div className={styles.sizePanel}>
                <div className={styles.sizePanelHeading}>
                  <span className={styles.availableLabel}>Available Sizes</span>
                  {selectedSize && (
                    <span className={styles.sizeSelectedNote}>Selected: {selectedSize}</span>
                  )}
                </div>
                <div className={styles.sizeGrid}>
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`${styles.sizeChip} ${
                        selectedSize === size ? styles.sizeChipActive : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.actionButtons}>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${selectedSize ? styles.btnPurple : ""}`}
                type="button"
                onClick={handleBuy}
              >
                Checkout via WhatsApp
              </button>
              <button
                className={`${styles.btn} ${styles.btnAccent} ${selectedSize ? styles.btnPurple : ""}`}
                type="button"
                onClick={handleAddToCart}
              >
                Add to cart
              </button>
            </div>
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
    </div>
  );
}

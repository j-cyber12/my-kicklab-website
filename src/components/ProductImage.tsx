/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import styles from "./ProductImage.module.css";

type Props = {
  src: string;
  alt?: string;
};

export default function ProductImage({ src, alt = "Product image" }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`${styles.wrapper} ${loaded ? styles.ready : ""}`}>
      {!loaded && <div className={styles.skeleton} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={styles.img}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = "/images/placeholder/placeholder-image.jpg";
          setLoaded(true);
        }}
      />
    </div>
  );
}

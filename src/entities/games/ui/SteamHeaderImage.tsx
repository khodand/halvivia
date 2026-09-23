'use client';

import Image from 'next/image';
import { useState } from 'react';

type SteamHeaderImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

export function SteamHeaderImage({ src, alt, sizes, priority = false }: SteamHeaderImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 p-3 text-center text-xs font-semibold text-neutral-700">
        {alt}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

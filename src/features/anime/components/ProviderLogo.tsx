"use client";

import Image from "next/image";
import { useState } from "react";
import type { StreamingProvider } from "../model/details";

export function ProviderLogo({ provider }: { provider: StreamingProvider }) {
  const [failed, setFailed] = useState<string | null>(null);
  return provider.icon && failed !== provider.icon ? (
    <span
      className="flex size-14 items-center justify-center rounded-xl"
      style={{ backgroundColor: provider.color ?? "#171717" }}
    >
      <Image
        src={provider.icon}
        alt=""
        width={36}
        height={36}
        unoptimized
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-9 object-contain"
        onError={() => setFailed(provider.icon)}
      />
    </span>
  ) : (
    <span className="max-w-28 text-center text-sm font-medium break-words text-brand">
      {provider.name}
    </span>
  );
}

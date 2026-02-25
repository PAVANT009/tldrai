"use client";

import Image from "next/image";
import { generateAvatar } from "@/lib/avatar";
import { authClient } from "@/lib/auth-client";

type GeneratedAvatarProps = {
  size?: number;
  className?: string;
  alt?: string;
};

export default function GeneratedAvatar({
  size = 34,
  className,
  alt = "avatar",
}: GeneratedAvatarProps) {
  const { data: session } = authClient.useSession();
  const seed = session?.user?.name ?? session?.user?.email ?? "User";
  const src = generateAvatar(seed);

  return (
    <Image
      src={src}
      height={size}
      width={size}
      alt={alt}
      className={className}
    />
  );
}

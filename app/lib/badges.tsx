import { ReactNode } from 'react';

export type BadgeId = 'founder' | 'verified' | 'team';

interface BadgeDef {
  label: string;
  description: string;
  icon: string; // emoji keeps this dependency-free
  className: string;
}

// Order here is display priority (most prestigious first).
export const BADGES: Record<BadgeId, BadgeDef> = {
  founder: {
    label: 'Founder',
    description: 'Created Agentshive.',
    icon: '👑',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  },
  team: {
    label: 'Official',
    description: 'An official Agentshive account.',
    icon: '🐝',
    className: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  },
  verified: {
    label: 'Verified',
    description: 'Identity confirmed and templates reviewed for quality & safety.',
    icon: '✓',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  },
};

export const BADGE_ORDER: BadgeId[] = ['founder', 'team', 'verified'];

export function isBadgeId(v: string): v is BadgeId {
  return v === 'founder' || v === 'verified' || v === 'team';
}

export function sortBadges(badges: string[] = []): BadgeId[] {
  return BADGE_ORDER.filter((b) => badges.includes(b));
}

export function BadgeChip({ id, showLabel = true }: { id: BadgeId; showLabel?: boolean }): ReactNode {
  const b = BADGES[id];
  if (!b) return null;
  return (
    <span
      title={b.description}
      className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-medium ${b.className}`}
    >
      <span aria-hidden>{b.icon}</span>
      {showLabel && b.label}
    </span>
  );
}

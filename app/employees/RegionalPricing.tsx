'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Globe2 } from 'lucide-react';

type Market = 'IN' | 'US' | 'CA' | 'GB' | 'EU' | 'AU' | 'SG' | 'AE' | 'ROW';

type PriceBook = {
  label: string;
  currencyLabel: string;
  pilot: string;
  starter: string;
  growth: string;
  comparison: string;
};

const PRICE_BOOKS: Record<Market, PriceBook> = {
  IN: {
    label: 'India',
    currencyLabel: 'INR',
    pilot: '₹0',
    starter: '₹4,999',
    growth: '₹14,999',
    comparison: 'India pricing stays founder-friendly for local SMEs.',
  },
  US: {
    label: 'United States',
    currencyLabel: 'USD',
    pilot: '$0',
    starter: '$149',
    growth: '$449',
    comparison: 'Growth is positioned at a fraction of one US junior employee’s monthly cost.',
  },
  CA: {
    label: 'Canada',
    currencyLabel: 'CAD',
    pilot: 'C$0',
    starter: 'C$199',
    growth: 'C$599',
    comparison: 'Growth is positioned at a fraction of one Canadian junior employee’s monthly cost.',
  },
  GB: {
    label: 'United Kingdom',
    currencyLabel: 'GBP',
    pilot: '£0',
    starter: '£119',
    growth: '£349',
    comparison: 'Growth is positioned at a fraction of one UK junior employee’s monthly cost.',
  },
  EU: {
    label: 'Euro area',
    currencyLabel: 'EUR',
    pilot: '€0',
    starter: '€129',
    growth: '€379',
    comparison: 'Growth is positioned below typical junior staffing costs across euro-area markets.',
  },
  AU: {
    label: 'Australia',
    currencyLabel: 'AUD',
    pilot: 'A$0',
    starter: 'A$229',
    growth: 'A$699',
    comparison: 'Growth is positioned at a fraction of one Australian junior employee’s monthly cost.',
  },
  SG: {
    label: 'Singapore',
    currencyLabel: 'SGD',
    pilot: 'S$0',
    starter: 'S$199',
    growth: 'S$599',
    comparison: 'Growth is positioned at a fraction of one Singapore junior employee’s monthly cost.',
  },
  AE: {
    label: 'United Arab Emirates',
    currencyLabel: 'AED',
    pilot: 'AED 0',
    starter: 'AED 549',
    growth: 'AED 1,649',
    comparison: 'Growth is positioned at a fraction of one UAE junior employee’s monthly cost.',
  },
  ROW: {
    label: 'Other countries',
    currencyLabel: 'USD',
    pilot: '$0',
    starter: '$129',
    growth: '$399',
    comparison: 'International pricing is set above India while remaining well below the cost of a hire.',
  },
};

const EURO_AREA = new Set([
  'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
]);

const DIRECT_MARKETS: Partial<Record<string, Market>> = {
  IN: 'IN',
  US: 'US',
  CA: 'CA',
  GB: 'GB',
  AU: 'AU',
  SG: 'SG',
  AE: 'AE',
};

const MARKET_ORDER: Market[] = ['IN', 'US', 'CA', 'GB', 'EU', 'AU', 'SG', 'AE', 'ROW'];
const STORAGE_KEY = 'agentshive-business-market';

function marketFromCountry(country: string): Market {
  const code = country.toUpperCase();
  return DIRECT_MARKETS[code] ?? (EURO_AREA.has(code) ? 'EU' : 'ROW');
}

const PLAN_DETAILS = [
  {
    name: 'Pilot',
    priceKey: 'pilot' as const,
    note: 'For selected early businesses',
    features: ['One AI employee', 'Web demo channel', 'Human approval mode', 'Basic activity summary'],
  },
  {
    name: 'Starter',
    priceKey: 'starter' as const,
    note: 'per month — proposed regional price',
    features: ['One AI employee', '1,000 monthly tasks', 'Knowledge setup', 'Email support'],
  },
  {
    name: 'Growth',
    priceKey: 'growth' as const,
    note: 'per month — proposed regional price',
    features: ['Up to three employees', 'Approval workflows', 'CRM/calendar connections', 'Advanced reporting'],
  },
] as const;

export default function RegionalPricing() {
  const [market, setMarket] = useState<Market>('ROW');
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    const savedMarket = window.localStorage.getItem(STORAGE_KEY);
    if (savedMarket && MARKET_ORDER.includes(savedMarket as Market)) {
      setMarket(savedMarket as Market);
      setDetecting(false);
      return;
    }

    fetch('/api/region', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: { country?: string }) => {
        setMarket(marketFromCountry(data.country ?? 'ROW'));
      })
      .catch(() => setMarket('ROW'))
      .finally(() => setDetecting(false));
  }, []);

  const priceBook = PRICE_BOOKS[market];
  const plans = useMemo(
    () =>
      PLAN_DETAILS.map((plan) => ({
        ...plan,
        price: priceBook[plan.priceKey],
      })),
    [priceBook],
  );

  function changeMarket(nextMarket: Market) {
    setMarket(nextMarket);
    window.localStorage.setItem(STORAGE_KEY, nextMarket);
  }

  return (
    <section id="pricing" className="border-y border-slate-800 bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Display-only pricing</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Simple plans, priced for your market</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            India keeps founder-friendly pricing. Other markets are priced against local business value—not direct currency conversion.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-950/80 p-4 sm:flex-row">
          <div className="flex items-start gap-3 text-left">
            <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">
                {detecting ? 'Detecting your pricing region…' : `Pricing for ${priceBook.label}`}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{priceBook.comparison}</p>
            </div>
          </div>
          <label className="flex w-full items-center gap-2 text-sm text-slate-300 sm:w-auto">
            <span className="shrink-0">Region</span>
            <select
              aria-label="Choose pricing region"
              value={market}
              onChange={(event) => changeMarket(event.target.value as Market)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 sm:w-52"
            >
              {MARKET_ORDER.map((marketCode) => (
                <option key={marketCode} value={marketCode}>
                  {PRICE_BOOKS[marketCode].label} · {PRICE_BOOKS[marketCode].currencyLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-5 text-4xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-500">{plan.note}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400" /> {feature}
                  </p>
                ))}
              </div>
              <span className="mt-8 block w-full rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-400">
                Payments coming later
              </span>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-slate-500">
          Your region is estimated from the request country and does not require location permission. You can always change it here.
          Final billing country and taxes will be verified when payments are introduced.
        </p>
      </div>
    </section>
  );
}

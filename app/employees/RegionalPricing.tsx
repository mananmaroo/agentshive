'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Globe2 } from 'lucide-react';

type Market = 'IN' | 'US' | 'CA' | 'GB' | 'EU' | 'AU' | 'SG' | 'AE' | 'ROW';
type BillingCycle = 'monthly' | 'six_month' | 'annual';

type PriceBook = {
  label: string;
  currencyLabel: string;
  currency: string;
  locale: string;
  starter: number;
  growth: number;
  comparison: string;
};

const PRICE_BOOKS: Record<Market, PriceBook> = {
  IN: {
    label: 'India',
    currencyLabel: 'INR',
    currency: 'INR',
    locale: 'en-IN',
    starter: 4999,
    growth: 14999,
    comparison: 'India keeps simple monthly pricing for local SMEs.',
  },
  US: {
    label: 'United States',
    currencyLabel: 'USD',
    currency: 'USD',
    locale: 'en-US',
    starter: 149,
    growth: 449,
    comparison: 'Growth is positioned at a fraction of one US junior employee’s monthly cost.',
  },
  CA: {
    label: 'Canada',
    currencyLabel: 'CAD',
    currency: 'CAD',
    locale: 'en-CA',
    starter: 199,
    growth: 599,
    comparison: 'Growth is positioned at a fraction of one Canadian junior employee’s monthly cost.',
  },
  GB: {
    label: 'United Kingdom',
    currencyLabel: 'GBP',
    currency: 'GBP',
    locale: 'en-GB',
    starter: 119,
    growth: 349,
    comparison: 'Growth is positioned at a fraction of one UK junior employee’s monthly cost.',
  },
  EU: {
    label: 'Euro area',
    currencyLabel: 'EUR',
    currency: 'EUR',
    locale: 'en-IE',
    starter: 129,
    growth: 379,
    comparison: 'Growth is positioned below typical junior staffing costs across euro-area markets.',
  },
  AU: {
    label: 'Australia',
    currencyLabel: 'AUD',
    currency: 'AUD',
    locale: 'en-AU',
    starter: 229,
    growth: 699,
    comparison: 'Growth is positioned at a fraction of one Australian junior employee’s monthly cost.',
  },
  SG: {
    label: 'Singapore',
    currencyLabel: 'SGD',
    currency: 'SGD',
    locale: 'en-SG',
    starter: 199,
    growth: 599,
    comparison: 'Growth is positioned at a fraction of one Singapore junior employee’s monthly cost.',
  },
  AE: {
    label: 'United Arab Emirates',
    currencyLabel: 'AED',
    currency: 'AED',
    locale: 'en-AE',
    starter: 549,
    growth: 1649,
    comparison: 'Growth is positioned at a fraction of one UAE junior employee’s monthly cost.',
  },
  ROW: {
    label: 'Other countries',
    currencyLabel: 'USD',
    currency: 'USD',
    locale: 'en-US',
    starter: 129,
    growth: 399,
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

function cycleDetails(cycle: BillingCycle) {
  if (cycle === 'six_month') return { months: 6, discount: 0.05, label: '6 months' };
  if (cycle === 'annual') return { months: 12, discount: 0.1, label: '12 months' };
  return { months: 1, discount: 0, label: 'Monthly' };
}

function formatMoney(value: number, book: PriceBook) {
  return new Intl.NumberFormat(book.locale, {
    style: 'currency',
    currency: book.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

const PLAN_DETAILS = [
  {
    name: 'Pilot',
    priceKey: null,
    features: ['One AI employee', 'Web demo channel', 'Human approval mode', 'Basic activity summary'],
  },
  {
    name: 'Starter',
    priceKey: 'starter' as const,
    features: ['One AI employee', '1,000 monthly tasks', 'Knowledge setup', 'Email support'],
  },
  {
    name: 'Growth',
    priceKey: 'growth' as const,
    features: ['Up to three employees', 'Approval workflows', 'CRM/calendar connections', 'Advanced reporting'],
  },
] as const;

export default function RegionalPricing() {
  const [market, setMarket] = useState<Market>('ROW');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
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
      .then((data: { country?: string }) => setMarket(marketFromCountry(data.country ?? 'ROW')))
      .catch(() => setMarket('ROW'))
      .finally(() => setDetecting(false));
  }, []);

  const priceBook = PRICE_BOOKS[market];
  const selectedCycle = market === 'IN' ? 'monthly' : billingCycle;
  const cycle = cycleDetails(selectedCycle);

  const plans = useMemo(
    () =>
      PLAN_DETAILS.map((plan) => {
        if (plan.priceKey === null) {
          return {
            ...plan,
            price: formatMoney(0, priceBook),
            note: 'For selected early businesses',
            effectiveMonthly: null,
            savings: null,
          };
        }

        const monthlyPrice = priceBook[plan.priceKey];
        const fullTotal = monthlyPrice * cycle.months;
        const discountedTotal = fullTotal * (1 - cycle.discount);

        return {
          ...plan,
          price: formatMoney(selectedCycle === 'monthly' ? monthlyPrice : discountedTotal, priceBook),
          note:
            selectedCycle === 'monthly'
              ? 'per month — proposed regional price'
              : `billed every ${cycle.months} months`,
          effectiveMonthly:
            selectedCycle === 'monthly'
              ? null
              : `${formatMoney(discountedTotal / cycle.months, priceBook)} effective monthly`,
          savings:
            cycle.discount > 0
              ? `Save ${formatMoney(fullTotal - discountedTotal, priceBook)} · ${Math.round(cycle.discount * 100)}% off`
              : null,
        };
      }),
    [cycle.discount, cycle.months, priceBook, selectedCycle],
  );

  function changeMarket(nextMarket: Market) {
    setMarket(nextMarket);
    setBillingCycle('monthly');
    window.localStorage.setItem(STORAGE_KEY, nextMarket);
  }

  return (
    <section id="pricing" className="border-y border-slate-800 bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Display-only pricing</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Simple plans, priced for your market</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            India keeps monthly pricing. International customers can save 5% with six months or 10% with one year.
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

        {market === 'IN' ? (
          <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-slate-400">
            India currently uses monthly plans only.
          </p>
        ) : (
          <div className="mx-auto mt-6 flex w-fit flex-wrap justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-1.5" aria-label="Billing period">
            {[
              ['monthly', 'Monthly'],
              ['six_month', '6 months · Save 5%'],
              ['annual', '12 months · Save 10%'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBillingCycle(value as BillingCycle)}
                aria-pressed={billingCycle === value}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  billingCycle === value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-5 text-4xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-500">{plan.note}</p>
              {plan.effectiveMonthly && <p className="mt-2 text-sm text-slate-300">{plan.effectiveMonthly}</p>}
              {plan.savings && <p className="mt-2 text-sm font-semibold text-emerald-400">{plan.savings}</p>}
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
          Final billing country, taxes and subscription terms will be verified when payments are introduced.
        </p>
      </div>
    </section>
  );
}

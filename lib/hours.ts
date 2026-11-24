import { siteConfig } from "./site-config";
import { ORDERING } from "./ordering-config";
import type { PickupChoice, PickupInfo, PickupSlot } from "./order-types";

/** Current date, weekday and minutes-after-midnight in Toronto. */
export function torontoParts(now: Date = new Date()) {
    const f = new Intl.DateTimeFormat("en-CA", {
        timeZone: ORDERING.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
    return {
        date: `${p.year}-${p.month}-${p.day}`,
        weekday: p.weekday,
        minutes: (Number(p.hour) % 24) * 60 + Number(p.minute),
    };
}

const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

export function hoursForWeekday(weekday: string): { opens: number; closes: number } | null {
    const h = siteConfig.openingHoursSpec.find((x) => (x.days as readonly string[]).includes(weekday));
    return h ? { opens: toMinutes(h.opens), closes: toMinutes(h.closes) } : null;
}

export function formatMinutes(total: number): string {
    const h24 = Math.floor(total / 60) % 24;
    const m = total % 60;
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;

/** Pickup availability for today, computed from the opening hours. */
export function getPickupInfo(now: Date = new Date()): PickupInfo {
    const t = torontoParts(now);
    const hours = hoursForWeekday(t.weekday);
    const closedInfo = (message: string): PickupInfo => ({ open: false, message, date: t.date, asapLabel: null, slots: [] });

    if (!hours) return closedInfo("We're closed today.");

    const lastPickup = hours.closes - ORDERING.lastPickupBeforeCloseMinutes;
    const earliestAsap = t.minutes + ORDERING.prepMinutes;
    const earliestSlot = roundUp(Math.max(earliestAsap, hours.opens), ORDERING.slotMinutes);

    if (earliestSlot > lastPickup) {
        return closedInfo(
            t.minutes < hours.opens
                ? `Online ordering for today opens at ${formatMinutes(hours.opens)}.`
                : "Online ordering has ended for today. We'd love to see you tomorrow."
        );
    }

    const slots: PickupSlot[] = [];
    for (let m = earliestSlot; m <= lastPickup; m += ORDERING.slotMinutes) slots.push({ minutes: m, label: formatMinutes(m) });

    const asapPossible = t.minutes >= hours.opens && earliestAsap <= lastPickup;
    return {
        open: true,
        date: t.date,
        asapLabel: asapPossible ? `about ${ORDERING.prepMinutes} minutes` : null,
        slots,
    };
}

/** Server-side check of the pickup time the customer chose. Returns the display label or an error. */
export function validatePickup(choice: PickupChoice, now: Date = new Date()): { ok: true; label: string; minutes: number; date: string } | { ok: false; error: string } {
    const info = getPickupInfo(now);
    if (!info.open) return { ok: false, error: info.message || "Ordering is closed right now." };

    if (choice.asap) {
        if (!info.asapLabel) return { ok: false, error: "ASAP pickup isn't available right now. Please choose a pickup time." };
        const t = torontoParts(now);
        const minutes = t.minutes + ORDERING.prepMinutes;
        return { ok: true, label: `ASAP (${info.asapLabel})`, minutes, date: info.date };
    }

    const slot = info.slots.find((s) => s.minutes === choice.minutes);
    if (!slot) return { ok: false, error: "That pickup time is no longer available. Please choose another." };
    return { ok: true, label: slot.label, minutes: slot.minutes, date: info.date };
}

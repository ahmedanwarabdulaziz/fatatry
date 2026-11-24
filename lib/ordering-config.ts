// Online ordering settings (safe to import from client and server code).

export const ORDERING = {
    timezone: "America/Toronto",
    prepMinutes: 25, // time to prepare an ASAP order
    slotMinutes: 15, // scheduled pickup times are offered every 15 minutes
    lastPickupBeforeCloseMinutes: 15, // last pickup is this long before closing
    maxLines: 30,
    maxQtyPerLine: 20,
    maxNoteLength: 200,
} as const;

// Clover groups that really mean "pick one", but Clover has no maximum set on them.
// (Lower-case group names.) Anything else without a Clover maximum allows several choices.
export const SINGLE_CHOICE_GROUPS = new Set([
    "plates",
    "spice level",
    "eggs",
    "spiro flavour",
    "canned pop flavour",
    "barbican",
    "regular/sarokh",
    "kebda & sujuk",
    "tea",
    "coffee",
    "herbal tea",
    "dubai sweet feteer",
]);

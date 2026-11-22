// Public business details used across the website.
// Source: Elfatatry Google Business Profile (checked 2026-11-22).
// Empty strings are hidden on the site; fill them in when confirmed.

export const siteConfig = {
    name: "Elfatatry",
    nameAr: "الفطاطري",
    tagline: "Made with love, shared with family",
    description:
        "Egyptian restaurant in Streetsville, Mississauga: hand-stretched feteer, Egyptian home dishes, grills and catering.",

    // Set to true when online ordering (Phase 2) goes live.
    orderingEnabled: false,

    address: {
        street: "117 Queen St S, Unit 5 & 6",
        neighbourhood: "Streetsville",
        city: "Mississauga",
        province: "ON",
        postalCode: "L5M 1K7",
        country: "CA",
    },
    geo: { lat: 43.5842413, lng: -79.716187 },
    phone: "(437) 799-7773",
    email: "", // TODO(owner): add public email

    hours: [
        { days: "Monday", time: "Closed" },
        { days: "Tuesday – Thursday", time: "11:00 AM – 10:00 PM" },
        { days: "Friday", time: "11:00 AM – 11:00 PM" },
        { days: "Saturday", time: "10:00 AM – 11:00 PM" },
        { days: "Sunday", time: "10:00 AM – 10:00 PM" },
    ],
    // Schema.org format for structured data
    openingHoursSpec: [
        { days: ["Tuesday", "Wednesday", "Thursday"], opens: "11:00", closes: "22:00" },
        { days: ["Friday"], opens: "11:00", closes: "23:00" },
        { days: ["Saturday"], opens: "10:00", closes: "23:00" },
        { days: ["Sunday"], opens: "10:00", closes: "22:00" },
    ],

    google: {
        rating: 4.7,
        // Opens the Elfatatry listing (reviews, photos, directions)
        mapsUrl: "https://maps.google.com/?cid=191093131852875806",
    },

    social: {
        instagram: "https://www.instagram.com/elfatatry1",
        facebook: "https://www.facebook.com/Fatatrey",
        tiktok: "",
    },
} as const;

export const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.province} ${siteConfig.address.postalCode}`;

export const phoneHref = `tel:+1${siteConfig.phone.replace(/\D/g, "")}`;

export const mapsUrl = siteConfig.google.mapsUrl;

export const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/catering", label: "Catering" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
] as const;

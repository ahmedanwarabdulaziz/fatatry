// Google Ads landing pages. Each page matches one ad campaign / audience.
// Pages are noindex so they don't compete with the main site in search.

export interface LandingPageContent {
    slug: string;
    metaTitle: string;
    eyebrow: string;
    headline: string;
    highlight: string;
    subheadline: string;
    heroImage: string;
    heroImagePosition?: string;
    reasonsTitle: string;
    reasons: { title: string; text: string }[];
    dishesTitle: string;
    dishSlugs: string[];
    steps?: { title: string; text: string }[];
    gallery?: { src: string; alt: string }[];
    showOffer: boolean;
    primaryCta: "call" | "directions";
    ctaTitle: string;
    ctaText: string;
}

export const landingPages: Record<string, LandingPageContent> = {
    halal: {
        slug: "halal",
        metaTitle: "Halal Egyptian Restaurant in Streetsville, Mississauga | Elfatatry",
        eyebrow: "100% Halal · Streetsville",
        headline: "Halal Egyptian food",
        highlight: "your whole family will love.",
        subheadline:
            "Juicy grills, crispy hawawshi and hand-stretched feteer stuffed with beef, cheese or chicken, baked fresh to order.",
        heroImage: "/images/site/grill-hero.webp",
        heroImagePosition: "center 45%",
        reasonsTitle: "Why families keep coming back",
        reasons: [
            { title: "All our meat is halal", text: "Every grill, every feteer, every dish. No need to ask twice." },
            { title: "Like a paratha, but flakier", text: "Our feteer is stretched by hand into dozens of buttery layers, then stuffed and baked until golden." },
            { title: "Big flavour, generous portions", text: "Egyptian spices, hearty plates and food made for sharing at the family table." },
            { title: "Loved by our guests", text: "Rated 4.7 on Google by families from across Mississauga." },
        ],
        dishesTitle: "Start with these",
        dishSlugs: ["grills", "savoury-feteer", "hawawshi", "koshary"],
        gallery: [
            { src: "/images/site/interior-1.webp", alt: "Our dining room" },
            { src: "/images/site/oven-toss.webp", alt: "Feteer stretched by hand" },
        ],
        showOffer: true,
        primaryCta: "directions",
        ctaTitle: "Bring the family this week.",
        ctaText: "Dine in, or call ahead and we'll have your order ready for pickup.",
    },
    "office-catering": {
        slug: "office-catering",
        metaTitle: "Office Catering in Mississauga: Halal Egyptian Trays | Elfatatry",
        eyebrow: "Office & Event Catering",
        headline: "Office catering",
        highlight: "your team will actually talk about.",
        subheadline:
            "Full trays of halal Egyptian favourites, from grills and rice to oven dishes and feteer, prepared fresh for meetings, team lunches and celebrations.",
        heroImage: "/images/site/catering-spread.webp",
        heroImagePosition: "center 55%",
        reasonsTitle: "Why teams choose Elfatatry",
        reasons: [
            { title: "Something for everyone", text: "Halal meat dishes plus vegetarian favourites like koshary, falafel and vegetarian feteer." },
            { title: "Feeds a crowd", text: "Generous trays sized for small meetings or big company events." },
            { title: "Easy to order", text: "Call us with your date, headcount and budget, and we'll suggest a menu." },
            { title: "Something different", text: "Skip the usual sandwiches and pizza. Treat your team to authentic Egyptian food." },
        ],
        dishesTitle: "Crowd favourites for your trays",
        dishSlugs: ["grills", "savoury-feteer", "koshary", "falafel"],
        steps: [
            { title: "Call us", text: "Tell us your date, number of guests and budget." },
            { title: "Get your menu", text: "We suggest trays that fit your team and budget." },
            { title: "Enjoy", text: "Fresh food, ready to serve on the day." },
        ],
        gallery: [
            { src: "/images/site/catering-event.webp", alt: "An event catered by Elfatatry" },
            { src: "/images/site/catering-buffet.webp", alt: "Catering buffet trays" },
        ],
        showOffer: false,
        primaryCta: "call",
        ctaTitle: "Planning a team lunch or event?",
        ctaText: "Call us and we'll put together a catering menu for your group.",
    },
};

// Signature dish pages (/dishes/[slug]).
// Menu items shown on each page come live from the admin menu: dine-in categories only,
// matched by category name and/or item name.

export interface Dish {
    slug: string;
    name: string;
    nameAr: string;
    tagline: string;
    intro: string[];
    facts: string[];
    image: string;
    imagePosition?: string;
    badge?: string;
    match: { categories?: string[]; items?: RegExp };
    metaTitle: string;
    metaDescription: string;
}

export const dishes: Dish[] = [
    {
        slug: "feteer-meshaltet",
        name: "Feteer Meshaltet",
        nameAr: "فطير مشلتت",
        tagline: "Egypt's famous layered pastry, made by hand.",
        intro: [
            "Feteer meshaltet is the original. Dough is stretched paper-thin by hand, brushed with butter, folded into dozens of layers and baked until golden and crackly outside, soft and buttery inside.",
            "Egyptians eat it for breakfast, at family gatherings and on special occasions, torn by hand and dipped into honey, molasses with tahini, rich keshta cream or aged mesh cheese.",
        ],
        facts: ["Hand-stretched and baked fresh to order", "Pairs with sweet or savoury sides", "Made for sharing"],
        image: "/images/site/dish-feteer.webp",
        match: { categories: ["Meshaltet"] },
        metaTitle: "Feteer Meshaltet in Mississauga | Elfatatry",
        metaDescription: "Hand-stretched Egyptian feteer meshaltet, baked fresh to order in Streetsville, Mississauga. Served with honey, keshta cream or mesh cheese.",
    },
    {
        slug: "savoury-feteer",
        name: "Savoury Feteer",
        nameAr: "فطير حادق",
        tagline: "Flaky layers, generously stuffed. A meal in itself.",
        intro: [
            "Think of a paratha or a stuffed pie, but flakier. Our savoury feteer is stretched by hand, filled and baked until the layers turn golden and crisp.",
            "Choose from seasoned beef, sujuk, pastirma, chicken, tuna, a three-cheese mix or our Elfatatry Special. There's a vegetarian feteer too. All our meat is halal.",
        ],
        facts: ["100% halal meat", "Vegetarian option available", "Big enough to share"],
        image: "/images/site/feteer-savoury.webp",
        badge: "Halal",
        match: { categories: ["Savoury Feteer"] },
        metaTitle: "Savoury Feteer (Egyptian Stuffed Pastry) in Mississauga | Elfatatry",
        metaDescription: "Halal savoury feteer stuffed with beef, cheese, chicken, sujuk and more. Hand-stretched and baked fresh in Streetsville, Mississauga.",
    },
    {
        slug: "sweet-feteer",
        name: "Sweet Feteer",
        nameAr: "فطير حلو",
        tagline: "Warm, buttery layers with a sweet filling.",
        intro: [
            "Our sweet feteer is dessert done the Egyptian way: hand-stretched layers baked fresh and filled with something indulgent.",
            "Go classic with sugar and milk, custard, or traditional keshta cream with honey, or try a modern favourite like Nutella, Lotus or Dubai chocolate.",
        ],
        facts: ["Classic and modern fillings", "Perfect with Turkish coffee or tea", "Great for sharing after a meal"],
        image: "/images/site/feteer-sweet.webp",
        match: { categories: ["Sweet Feteer"] },
        metaTitle: "Sweet Feteer in Mississauga: Nutella, Lotus & Custard | Elfatatry",
        metaDescription: "Egyptian sweet feteer with Nutella, Lotus, custard, keshta and honey or Dubai chocolate. Baked fresh in Streetsville, Mississauga.",
    },
    {
        slug: "hawawshi",
        name: "Hawawshi",
        nameAr: "حواوشي",
        tagline: "Egypt's take on the burger.",
        intro: [
            "Hawawshi is one of Egypt's best-loved street foods: seasoned, spiced ground beef baked inside Egyptian bread until the outside is crispy and the inside is juicy.",
            "We serve it with tahini sauce. All our meat is halal.",
        ],
        facts: ["100% halal beef", "Crispy outside, juicy inside", "A favourite with first-timers"],
        image: "/images/site/dish-hawawshi.webp",
        badge: "Halal",
        match: { items: /hawawshi/i },
        metaTitle: "Hawawshi (Egyptian Stuffed Bread) in Mississauga | Elfatatry",
        metaDescription: "Halal Egyptian hawawshi: spiced beef baked in crispy Egyptian bread. Try it in Streetsville, Mississauga.",
    },
    {
        slug: "grills",
        name: "Egyptian Grills",
        nameAr: "مشويات",
        tagline: "Kofta, shish tawouk, lamb chops and more.",
        intro: [
            "Our grills are seasoned with Egyptian spices and cooked until juicy and char-kissed: kofta, shish tawouk, tarb and lamb chops.",
            "Plates come with rice or fries, salad and tahini. All our meat is halal.",
        ],
        facts: ["100% halal meat", "Served with rice or fries, salad and tahini", "Great for groups and catering"],
        image: "/images/site/dish-grill.webp",
        badge: "Halal",
        match: { items: /kofta|shish|lamb chop|tarb|kabab|kebab/i },
        metaTitle: "Halal Grills in Mississauga: Kofta, Shish Tawouk, Lamb Chops | Elfatatry",
        metaDescription: "Halal Egyptian grills in Streetsville, Mississauga: kofta, shish tawouk and lamb chops served with rice or fries, salad and tahini.",
    },
    {
        slug: "molokhya",
        name: "Molokhya",
        nameAr: "ملوخية",
        tagline: "The green stew every Egyptian grew up with.",
        intro: [
            "Molokhya is pure Egyptian home cooking: finely minced greens simmered in a rich, savoury broth with plenty of garlic.",
            "It's silky, garlicky and comforting. Enjoy it with rice or bread.",
        ],
        facts: ["Classic Egyptian home cooking", "Best with rice or bread", "Comfort in a bowl"],
        image: "/images/site/dish-molokhya.webp",
        match: { items: /molokh/i },
        metaTitle: "Molokhya (Egyptian Green Stew) in Mississauga | Elfatatry",
        metaDescription: "Traditional Egyptian molokhya, made the home-cooked way. Try it at Elfatatry in Streetsville, Mississauga.",
    },
    {
        slug: "koshary",
        name: "Koshary",
        nameAr: "كشري",
        tagline: "Egypt's national comfort food.",
        intro: [
            "Koshary is the dish all of Egypt agrees on: rice, lentils and pasta topped with crispy fried onions and a tangy tomato sauce.",
            "Our classic koshary is fully vegetarian. Want it heartier? Add Alexandrian-style liver or sujuk.",
        ],
        facts: ["Classic koshary is fully vegetarian", "Hearty, filling and full of flavour", "Halal meat toppings available"],
        image: "/images/site/dish-koshari.webp",
        badge: "Vegetarian",
        match: { items: /koshar/i },
        metaTitle: "Koshary in Mississauga: Vegetarian Egyptian Comfort Food | Elfatatry",
        metaDescription: "Authentic Egyptian koshary in Streetsville, Mississauga: rice, lentils, pasta, crispy onions and tangy tomato sauce. Fully vegetarian.",
    },
    {
        slug: "falafel",
        name: "Falafel (Ta'ameya)",
        nameAr: "طعمية",
        tagline: "Egyptian-style falafel, made with fava beans.",
        intro: [
            "Egyptian falafel, ta'ameya, is made with fava beans instead of chickpeas, packed with fresh herbs. It comes out bright green inside and extra crisp outside.",
            "Pair it with foul (slow-cooked fava beans), fresh bread and pickles for a proper Egyptian breakfast.",
        ],
        facts: ["Fully vegetarian", "Made with fava beans and fresh herbs", "Perfect with foul and bread"],
        image: "/images/site/dish-falafel.webp",
        badge: "Vegetarian",
        match: { items: /falafel|ta.?ameya|^foul/i },
        metaTitle: "Egyptian Falafel (Ta'ameya) in Mississauga | Elfatatry",
        metaDescription: "Vegetarian Egyptian falafel made with fava beans and fresh herbs, plus foul and fresh bread. Streetsville, Mississauga.",
    },
];

export const getDish = (slug: string) => dishes.find((d) => d.slug === slug);

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    });
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

const categories = [
    { name: 'Appetizers & Sides', type: 'catering', order: 100 },
    { name: 'Rice & Pasta', type: 'catering', order: 110 },
    { name: 'Oven Dishes (Sawaney)', type: 'catering', order: 120 },
    { name: 'Grill & Meats', type: 'catering', order: 130 },
];

const itemsData = [
    // Appetizers & Sides
    { categoryName: 'Appetizers & Sides', name: 'Pickled Eggplant', price: 0, sizes: [{ name: 'M', price: 35, servingDetails: {} }, { name: 'L', price: 70, servingDetails: {} }] },
    { categoryName: 'Appetizers & Sides', name: 'Betnjan Khal & Tom', price: 0, sizes: [{ name: 'M', price: 40, servingDetails: {} }, { name: 'L', price: 80, servingDetails: {} }] },
    { categoryName: 'Appetizers & Sides', name: 'Molokhya', price: 30, sizes: [] },
    { categoryName: 'Appetizers & Sides', name: 'Bamia (Okra)', price: 35, sizes: [] },

    // Rice & Pasta
    { categoryName: 'Rice & Pasta', name: 'Rice with vermicelli', price: 0, sizes: [{ name: 'M', price: 25, servingDetails: {} }, { name: 'L', price: 50, servingDetails: {} }] },
    { categoryName: 'Rice & Pasta', name: 'Rice with nuts', price: 0, sizes: [{ name: 'M', price: 40, servingDetails: {} }, { name: 'L', price: 80, servingDetails: {} }] },
    { categoryName: 'Rice & Pasta', name: 'Koshari', price: 0, sizes: [{ name: 'M', price: 35, servingDetails: {} }, { name: 'L', price: 70, servingDetails: {} }] },
    { categoryName: 'Rice & Pasta', name: 'Koshari with Kebda', price: 0, sizes: [{ name: 'M', price: 55, servingDetails: {} }, { name: 'L', price: 105, servingDetails: {} }] },
    { categoryName: 'Rice & Pasta', name: 'Macarona Bechamel', price: 0, sizes: [{ name: 'M', price: 45, servingDetails: {} }, { name: 'L', price: 90, servingDetails: {} }] },

    // Oven Dishes (Sawaney)
    { categoryName: 'Oven Dishes (Sawaney)', name: 'Musakaa with beef', price: 0, sizes: [{ name: 'M', price: 50, servingDetails: {} }, { name: 'L', price: 95, servingDetails: {} }] },
    { categoryName: 'Oven Dishes (Sawaney)', name: 'Golash with beef', price: 0, sizes: [{ name: 'M', price: 40, servingDetails: {} }, { name: 'L', price: 80, servingDetails: {} }] },
    { categoryName: 'Oven Dishes (Sawaney)', name: 'Golash with cheese', price: 0, sizes: [{ name: 'M', price: 40, servingDetails: {} }, { name: 'L', price: 80, servingDetails: {} }] },
    { categoryName: 'Oven Dishes (Sawaney)', name: 'Hawawshi (5 - 10 baladi bread)', price: 0, sizes: [{ name: 'M', price: 55, servingDetails: {} }, { name: 'L', price: 110, servingDetails: {} }] },

    // Grill & Meats
    { categoryName: 'Grill & Meats', name: 'Kebda Iskandrani (Beef liver)', price: 40, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Sujuk Iskandrani (Beef sausage)', price: 55, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Kofta', price: 45, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Shish Tawook', price: 50, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Lamb Chops', price: 80, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Kabab (Beef Tenderloin)', price: 80, sizes: [] },
    { categoryName: 'Grill & Meats', name: 'Chicken Panee', price: 50, sizes: [] },
];

async function seed() {
    console.log('Seeding categories...');
    const catNameToId: Record<string, string> = {};
    
    for (const cat of categories) {
        const docRef = await db.collection('categories').add({
            name: cat.name,
            type: cat.type,
            order: cat.order,
            isFeatured: false,
            heroImage: '',
            squareImage: '',
            createdAt: new Date().toISOString()
        });
        catNameToId[cat.name] = docRef.id;
        console.log(`Created category ${cat.name} with ID ${docRef.id}`);
    }

    console.log('Seeding items...');
    let order = 1000;
    for (const item of itemsData) {
        const categoryId = catNameToId[item.categoryName];
        if (!categoryId) {
            console.error(`Category not found for item ${item.name}`);
            continue;
        }

        await db.collection('menu_items').add({
            name: item.name,
            categoryId: categoryId,
            price: item.price,
            sizes: item.sizes,
            isFeatured: false,
            heroImage: '',
            squareImage: '',
            servingDetails: {},
            addons: [],
            order: order++,
            createdAt: new Date().toISOString()
        });
        console.log(`Created item ${item.name}`);
    }

    console.log('Seeding complete!');
}

seed().catch(console.error);

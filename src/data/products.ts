export type ProductShape = 'bottle' | 'can' | 'box' | 'bag' | 'jar' | 'produce'

export interface Product {
  id: string
  name: string
  category: string
  costPrice: number
  retailPrice: number
  /** Base body color of the procedural package mesh. */
  color: string
  /** Cap/lid/label-accent color. */
  accentColor: string
  shape: ProductShape
}

// clang-format off
const RAW_PRODUCTS: Omit<Product, 'id'>[] = [
  // Dairy
  { name: 'Milk', category: 'Dairy', costPrice: 1.8, retailPrice: 3.49, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bottle' },
  { name: 'Eggs', category: 'Dairy', costPrice: 2.1, retailPrice: 3.99, color: '#ece1c8', accentColor: '#b08c4f', shape: 'box' },
  { name: 'Butter', category: 'Dairy', costPrice: 2.6, retailPrice: 4.49, color: '#f2dd8e', accentColor: '#c9a227', shape: 'box' },
  { name: 'Cheese Block', category: 'Dairy', costPrice: 3.2, retailPrice: 5.79, color: '#f0c96b', accentColor: '#d97a1f', shape: 'box' },
  { name: 'Yogurt Cup', category: 'Dairy', costPrice: 0.6, retailPrice: 1.29, color: '#fbfbf5', accentColor: '#8a4fb0', shape: 'jar' },
  { name: 'Sour Cream', category: 'Dairy', costPrice: 1.1, retailPrice: 2.19, color: '#fbfbf5', accentColor: '#2f6fb0', shape: 'jar' },

  // Bakery
  { name: 'Bread', category: 'Bakery', costPrice: 1.2, retailPrice: 2.79, color: '#d9a441', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Bagels', category: 'Bakery', costPrice: 1.6, retailPrice: 3.29, color: '#cf9a4c', accentColor: '#e08a1f', shape: 'bag' },
  { name: 'Muffins', category: 'Bakery', costPrice: 2.0, retailPrice: 3.99, color: '#8a5a34', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Tortillas', category: 'Bakery', costPrice: 1.3, retailPrice: 2.69, color: '#e8d9a0', accentColor: '#4a8f4a', shape: 'bag' },
  { name: 'Dinner Rolls', category: 'Bakery', costPrice: 1.4, retailPrice: 2.89, color: '#c98a45', accentColor: '#c0392b', shape: 'bag' },

  // Produce
  { name: 'Apples', category: 'Produce', costPrice: 1.5, retailPrice: 2.99, color: '#b5322f', accentColor: '#7a201f', shape: 'produce' },
  { name: 'Bananas', category: 'Produce', costPrice: 0.7, retailPrice: 1.49, color: '#e8d23c', accentColor: '#a89226', shape: 'produce' },
  { name: 'Oranges', category: 'Produce', costPrice: 1.4, retailPrice: 2.79, color: '#e8862f', accentColor: '#a85f1f', shape: 'produce' },
  { name: 'Tomatoes', category: 'Produce', costPrice: 1.6, retailPrice: 3.19, color: '#c8382c', accentColor: '#4a8f4a', shape: 'produce' },
  { name: 'Potatoes', category: 'Produce', costPrice: 1.0, retailPrice: 2.19, color: '#a9835a', accentColor: '#7a5f42', shape: 'produce' },
  { name: 'Onions', category: 'Produce', costPrice: 0.9, retailPrice: 1.99, color: '#c9b896', accentColor: '#9c8563', shape: 'produce' },

  // Snacks
  { name: 'Chips', category: 'Snacks', costPrice: 0.9, retailPrice: 2.49, color: '#e6b800', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Pretzels', category: 'Snacks', costPrice: 1.0, retailPrice: 2.59, color: '#c9a26a', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Popcorn', category: 'Snacks', costPrice: 0.8, retailPrice: 2.29, color: '#e8d23c', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Crackers', category: 'Snacks', costPrice: 1.1, retailPrice: 2.79, color: '#c0392b', accentColor: '#e08a1f', shape: 'box' },
  { name: 'Trail Mix', category: 'Snacks', costPrice: 1.8, retailPrice: 3.79, color: '#7a5a3a', accentColor: '#4a8f4a', shape: 'bag' },
  { name: 'Nuts', category: 'Snacks', costPrice: 2.4, retailPrice: 4.99, color: '#c9a26a', accentColor: '#5a3f24', shape: 'jar' },

  // Beverages
  { name: 'Soda', category: 'Beverages', costPrice: 0.6, retailPrice: 1.79, color: '#c0392b', accentColor: '#9aa0a6', shape: 'can' },
  { name: 'Orange Juice', category: 'Beverages', costPrice: 1.9, retailPrice: 3.79, color: '#e8862f', accentColor: '#e8862f', shape: 'bottle' },
  { name: 'Bottled Water', category: 'Beverages', costPrice: 0.4, retailPrice: 1.19, color: '#cfe8f0', accentColor: '#2f6fb0', shape: 'bottle' },
  { name: 'Sports Drink', category: 'Beverages', costPrice: 0.9, retailPrice: 2.19, color: '#3ec2e0', accentColor: '#3ec2e0', shape: 'bottle' },
  { name: 'Iced Tea', category: 'Beverages', costPrice: 1.0, retailPrice: 2.29, color: '#b5793a', accentColor: '#e8d23c', shape: 'bottle' },
  { name: 'Coffee', category: 'Beverages', costPrice: 4.2, retailPrice: 7.99, color: '#4a3222', accentColor: '#c0392b', shape: 'jar' },

  // Frozen
  { name: 'Frozen Pizza', category: 'Frozen', costPrice: 2.8, retailPrice: 5.99, color: '#3f7fbf', accentColor: '#c0392b', shape: 'box' },
  { name: 'Ice Cream', category: 'Frozen', costPrice: 3.1, retailPrice: 5.79, color: '#f0b8c9', accentColor: '#fbfbf5', shape: 'jar' },
  { name: 'Frozen Vegetables', category: 'Frozen', costPrice: 1.4, retailPrice: 2.99, color: '#3f8a4f', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Frozen Waffles', category: 'Frozen', costPrice: 1.7, retailPrice: 3.49, color: '#e8c23c', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Frozen Burritos', category: 'Frozen', costPrice: 2.0, retailPrice: 4.19, color: '#c0392b', accentColor: '#e8c23c', shape: 'box' },

  // Breakfast
  { name: 'Cereal', category: 'Breakfast', costPrice: 2.4, retailPrice: 4.99, color: '#e07a1f', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Oatmeal', category: 'Breakfast', costPrice: 2.0, retailPrice: 3.99, color: '#c9a26a', accentColor: '#c0392b', shape: 'jar' },
  { name: 'Pancake Mix', category: 'Breakfast', costPrice: 1.6, retailPrice: 3.29, color: '#e8d23c', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Maple Syrup', category: 'Breakfast', costPrice: 2.9, retailPrice: 5.49, color: '#8a5a1f', accentColor: '#5a3a14', shape: 'bottle' },
  { name: 'Granola Bars', category: 'Breakfast', costPrice: 2.2, retailPrice: 4.29, color: '#8a5a34', accentColor: '#4a8f4a', shape: 'box' },

  // Candy
  { name: 'Chocolate Bar', category: 'Candy', costPrice: 0.8, retailPrice: 1.99, color: '#4a2f1f', accentColor: '#c9a227', shape: 'box' },
  { name: 'Gummy Bears', category: 'Candy', costPrice: 0.9, retailPrice: 2.19, color: '#d94f8c', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Mints', category: 'Candy', costPrice: 0.6, retailPrice: 1.59, color: '#eafaf0', accentColor: '#3f8a4f', shape: 'box' },
  { name: 'Lollipops', category: 'Candy', costPrice: 0.5, retailPrice: 1.29, color: '#e84f8c', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Candy Bag', category: 'Candy', costPrice: 1.1, retailPrice: 2.49, color: '#7a3fa0', accentColor: '#e8d23c', shape: 'bag' },

  // Household
  { name: 'Paper Towels', category: 'Household', costPrice: 2.6, retailPrice: 4.99, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Toilet Paper', category: 'Household', costPrice: 3.1, retailPrice: 5.99, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Dish Soap', category: 'Household', costPrice: 1.3, retailPrice: 2.69, color: '#3f8a4f', accentColor: '#3f8a4f', shape: 'bottle' },
  { name: 'Laundry Detergent', category: 'Household', costPrice: 4.2, retailPrice: 7.99, color: '#2f6fb0', accentColor: '#e08a1f', shape: 'bottle' },
  { name: 'Trash Bags', category: 'Household', costPrice: 2.4, retailPrice: 4.79, color: '#3a3f47', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Sponges', category: 'Household', costPrice: 1.0, retailPrice: 2.19, color: '#e8d23c', accentColor: '#3f8a4f', shape: 'box' },

  // Health & Beauty
  { name: 'Toothpaste', category: 'Health & Beauty', costPrice: 1.2, retailPrice: 2.59, color: '#2f6fb0', accentColor: '#c0392b', shape: 'bottle' },
  { name: 'Shampoo', category: 'Health & Beauty', costPrice: 1.8, retailPrice: 3.59, color: '#3f8a4f', accentColor: '#fbfbf5', shape: 'bottle' },
  { name: 'Soap Bar', category: 'Health & Beauty', costPrice: 0.7, retailPrice: 1.59, color: '#f0d8e0', accentColor: '#d94f8c', shape: 'box' },
  { name: 'Deodorant', category: 'Health & Beauty', costPrice: 1.6, retailPrice: 3.19, color: '#2f6fb0', accentColor: '#fbfbf5', shape: 'bottle' },
  { name: 'Hand Lotion', category: 'Health & Beauty', costPrice: 1.4, retailPrice: 2.89, color: '#f0c9d8', accentColor: '#fbfbf5', shape: 'bottle' },

  // Canned & Pantry
  { name: 'Canned Soup', category: 'Pantry', costPrice: 0.9, retailPrice: 1.99, color: '#c0392b', accentColor: '#fbfbf5', shape: 'can' },
  { name: 'Canned Beans', category: 'Pantry', costPrice: 0.8, retailPrice: 1.79, color: '#8a5a2f', accentColor: '#e8d23c', shape: 'can' },
  { name: 'Pasta', category: 'Pantry', costPrice: 1.0, retailPrice: 2.19, color: '#2f6fb0', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Rice', category: 'Pantry', costPrice: 1.6, retailPrice: 3.29, color: '#f5f5f0', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Peanut Butter', category: 'Pantry', costPrice: 1.9, retailPrice: 3.79, color: '#c9a26a', accentColor: '#c0392b', shape: 'jar' },
  { name: 'Tomato Sauce', category: 'Pantry', costPrice: 1.1, retailPrice: 2.29, color: '#b5322f', accentColor: '#3f8a4f', shape: 'jar' },
  { name: 'Olive Oil', category: 'Pantry', costPrice: 3.6, retailPrice: 6.99, color: '#3f5a2f', accentColor: '#c9a227', shape: 'bottle' },

  // Meat & Deli
  { name: 'Chicken Breast', category: 'Meat & Deli', costPrice: 3.8, retailPrice: 6.99, color: '#f0c9c0', accentColor: '#c0392b', shape: 'box' },
  { name: 'Ground Beef', category: 'Meat & Deli', costPrice: 3.4, retailPrice: 6.29, color: '#b5453a', accentColor: '#fbfbf5', shape: 'box' },
  { name: 'Bacon', category: 'Meat & Deli', costPrice: 2.9, retailPrice: 5.49, color: '#c9645a', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Deli Ham', category: 'Meat & Deli', costPrice: 2.6, retailPrice: 4.99, color: '#e0a0a8', accentColor: '#c0392b', shape: 'box' },
  { name: 'Sausage', category: 'Meat & Deli', costPrice: 2.4, retailPrice: 4.69, color: '#8a4f3a', accentColor: '#e8d23c', shape: 'bag' },

  // Baby
  { name: 'Diapers', category: 'Baby', costPrice: 5.4, retailPrice: 9.99, color: '#fbfbf5', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Baby Wipes', category: 'Baby', costPrice: 1.4, retailPrice: 2.79, color: '#fbfbf5', accentColor: '#3ec2e0', shape: 'box' },
  { name: 'Baby Formula', category: 'Baby', costPrice: 6.2, retailPrice: 11.49, color: '#f0e0a0', accentColor: '#2f6fb0', shape: 'jar' },
  { name: 'Baby Food Jar', category: 'Baby', costPrice: 0.7, retailPrice: 1.49, color: '#e8862f', accentColor: '#fbfbf5', shape: 'jar' },

  // Pet
  { name: 'Dog Food Bag', category: 'Pet', costPrice: 4.8, retailPrice: 8.99, color: '#8a5a2f', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Cat Food Can', category: 'Pet', costPrice: 0.7, retailPrice: 1.49, color: '#7a3fa0', accentColor: '#c9a227', shape: 'can' },
  { name: 'Pet Treats', category: 'Pet', costPrice: 1.6, retailPrice: 3.29, color: '#e8862f', accentColor: '#2f6fb0', shape: 'bag' },
]
// clang-format on

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => ({ id: slugify(p.name), ...p }))

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export const PRODUCT_CATEGORIES: string[] = Array.from(new Set(PRODUCTS.map((p) => p.category)))

export const SHELF_CAPACITY = 20
export const STOCKROOM_CAPACITY = 400

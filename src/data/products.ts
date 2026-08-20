export interface Product {
  id: string
  name: string
  category: string
  costPrice: number
  retailPrice: number
  color: string
}

export const PRODUCTS: Product[] = [
  { id: 'milk', name: 'Milk', category: 'Dairy', costPrice: 1.8, retailPrice: 3.49, color: '#f5f5f0' },
  { id: 'bread', name: 'Bread', category: 'Bakery', costPrice: 1.2, retailPrice: 2.79, color: '#d9a441' },
  { id: 'eggs', name: 'Eggs', category: 'Dairy', costPrice: 2.1, retailPrice: 3.99, color: '#e8d9b5' },
  { id: 'soda', name: 'Soda', category: 'Beverages', costPrice: 0.6, retailPrice: 1.79, color: '#c0392b' },
  { id: 'chips', name: 'Chips', category: 'Snacks', costPrice: 0.9, retailPrice: 2.49, color: '#e6b800' },
  { id: 'cereal', name: 'Cereal', category: 'Breakfast', costPrice: 2.4, retailPrice: 4.99, color: '#e07a1f' },
  { id: 'candy', name: 'Candy', category: 'Snacks', costPrice: 0.5, retailPrice: 1.49, color: '#d94f8c' },
  { id: 'frozen-pizza', name: 'Frozen Pizza', category: 'Frozen', costPrice: 2.8, retailPrice: 5.99, color: '#3f7fbf' },
]

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export const SHELF_CAPACITY = 20
export const STOCKROOM_CAPACITY = 400

export type ProductShape = 'bottle' | 'can' | 'box' | 'bag' | 'jar' | 'produce'

export type QualityTier = 'budget' | 'standard' | 'premium'

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  category: string
  qualityTier: QualityTier
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
  { name: 'Milk', brand: 'Meadow Gold Creamery', description: 'Vitamin D whole milk from grass-fed herds, bottled fresh daily.', category: 'Dairy', qualityTier: 'standard', costPrice: 1.8, retailPrice: 3.49, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bottle' },
  { name: 'Eggs', brand: 'Sunrise Farms', description: 'A dozen large brown eggs from free-range hens.', category: 'Dairy', qualityTier: 'standard', costPrice: 2.1, retailPrice: 3.99, color: '#ece1c8', accentColor: '#b08c4f', shape: 'box' },
  { name: 'Butter', brand: 'Green Pasture', description: 'Slow-churned salted butter with a rich, creamy finish.', category: 'Dairy', qualityTier: 'standard', costPrice: 2.6, retailPrice: 4.49, color: '#f2dd8e', accentColor: '#c9a227', shape: 'box' },
  { name: 'Cheese Block', brand: 'Green Pasture', description: 'Aged sharp cheddar, cut and wrapped in-store.', category: 'Dairy', qualityTier: 'premium', costPrice: 3.2, retailPrice: 5.79, color: '#f0c96b', accentColor: '#d97a1f', shape: 'box' },
  { name: 'Yogurt Cup', brand: 'Meadow Gold Creamery', description: 'Single-serve creamy yogurt with a fruit swirl at the bottom.', category: 'Dairy', qualityTier: 'budget', costPrice: 0.6, retailPrice: 1.29, color: '#fbfbf5', accentColor: '#8a4fb0', shape: 'jar' },
  { name: 'Sour Cream', brand: 'Sunrise Farms', description: 'Thick, tangy sour cream for toppings and baking alike.', category: 'Dairy', qualityTier: 'standard', costPrice: 1.1, retailPrice: 2.19, color: '#fbfbf5', accentColor: '#2f6fb0', shape: 'jar' },
  { name: 'Whipped Cream', brand: 'Meadow Gold Creamery', description: 'Light, fluffy dairy whipped topping in a squeeze can.', category: 'Dairy', qualityTier: 'standard', costPrice: 1.4, retailPrice: 2.79, color: '#fbfbf5', accentColor: '#2f6fb0', shape: 'can' },

  // Bakery
  { name: 'Bread', brand: 'Golden Crust Bakery', description: 'A soft sandwich loaf baked fresh every morning.', category: 'Bakery', qualityTier: 'standard', costPrice: 1.2, retailPrice: 2.79, color: '#d9a441', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Bagels', brand: 'Riverside Bakeshop', description: 'Chewy boiled-and-baked bagels, six to a bag.', category: 'Bakery', qualityTier: 'standard', costPrice: 1.6, retailPrice: 3.29, color: '#cf9a4c', accentColor: '#e08a1f', shape: 'bag' },
  { name: 'Muffins', brand: 'Hearth & Home', description: 'Bakery-style muffins with a golden, crumbly top.', category: 'Bakery', qualityTier: 'standard', costPrice: 2.0, retailPrice: 3.99, color: '#8a5a34', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Tortillas', brand: 'Riverside Bakeshop', description: 'Soft flour tortillas, perfect for wraps and tacos.', category: 'Bakery', qualityTier: 'budget', costPrice: 1.3, retailPrice: 2.69, color: '#e8d9a0', accentColor: '#4a8f4a', shape: 'bag' },
  { name: 'Dinner Rolls', brand: 'Golden Crust Bakery', description: 'Buttery dinner rolls, baked in small batches.', category: 'Bakery', qualityTier: 'standard', costPrice: 1.4, retailPrice: 2.89, color: '#c98a45', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Croissants', brand: 'Hearth & Home', description: 'Flaky, all-butter croissants proofed overnight.', category: 'Bakery', qualityTier: 'premium', costPrice: 2.3, retailPrice: 4.49, color: '#e0ab52', accentColor: '#c9a227', shape: 'bag' },

  // Produce
  { name: 'Apples', brand: 'Orchard Valley', description: 'Crisp, hand-picked apples from local orchards.', category: 'Produce', qualityTier: 'standard', costPrice: 1.5, retailPrice: 2.99, color: '#b5322f', accentColor: '#7a201f', shape: 'produce' },
  { name: 'Bananas', brand: 'Fieldharvest', description: 'Ripe yellow bananas sold by the bunch.', category: 'Produce', qualityTier: 'budget', costPrice: 0.7, retailPrice: 1.49, color: '#e8d23c', accentColor: '#a89226', shape: 'produce' },
  { name: 'Oranges', brand: 'Orchard Valley', description: 'Juicy navel oranges, sweet with a thin peel.', category: 'Produce', qualityTier: 'standard', costPrice: 1.4, retailPrice: 2.79, color: '#e8862f', accentColor: '#a85f1f', shape: 'produce' },
  { name: 'Tomatoes', brand: 'Farmstand Fresh', description: 'Vine-ripened tomatoes, still on the stem.', category: 'Produce', qualityTier: 'standard', costPrice: 1.6, retailPrice: 3.19, color: '#c8382c', accentColor: '#4a8f4a', shape: 'produce' },
  { name: 'Potatoes', brand: 'Fieldharvest', description: 'All-purpose russet potatoes, sold loose by weight.', category: 'Produce', qualityTier: 'budget', costPrice: 1.0, retailPrice: 2.19, color: '#a9835a', accentColor: '#7a5f42', shape: 'produce' },
  { name: 'Onions', brand: 'Fieldharvest', description: 'Yellow cooking onions with a mild, sweet bite.', category: 'Produce', qualityTier: 'budget', costPrice: 0.9, retailPrice: 1.99, color: '#c9b896', accentColor: '#9c8563', shape: 'produce' },
  { name: 'Avocados', brand: 'Farmstand Fresh', description: 'Creamy Hass avocados, hand-selected for ripeness.', category: 'Produce', qualityTier: 'premium', costPrice: 1.8, retailPrice: 3.49, color: '#4a5a2f', accentColor: '#2f3a1f', shape: 'produce' },

  // Snacks
  { name: 'Chips', brand: 'Crunch Time', description: 'Kettle-cooked potato chips, salted just right.', category: 'Snacks', qualityTier: 'standard', costPrice: 0.9, retailPrice: 2.49, color: '#e6b800', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Pretzels', brand: 'Snackwell Co.', description: 'Crunchy sourdough pretzel twists.', category: 'Snacks', qualityTier: 'budget', costPrice: 1.0, retailPrice: 2.59, color: '#c9a26a', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Popcorn', brand: 'Pantry Pals', description: 'Butter-flavored microwave popcorn, three bags.', category: 'Snacks', qualityTier: 'budget', costPrice: 0.8, retailPrice: 2.29, color: '#e8d23c', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Crackers', brand: 'Snackwell Co.', description: 'Buttery, flaky crackers for cheese boards or snacking.', category: 'Snacks', qualityTier: 'standard', costPrice: 1.1, retailPrice: 2.79, color: '#c0392b', accentColor: '#e08a1f', shape: 'box' },
  { name: 'Trail Mix', brand: 'Pantry Pals', description: 'A hearty mix of nuts, raisins, and chocolate pieces.', category: 'Snacks', qualityTier: 'standard', costPrice: 1.8, retailPrice: 3.79, color: '#7a5a3a', accentColor: '#4a8f4a', shape: 'bag' },
  { name: 'Nuts', brand: 'Crunch Time', description: 'Roasted and lightly salted mixed nuts.', category: 'Snacks', qualityTier: 'premium', costPrice: 2.4, retailPrice: 4.99, color: '#c9a26a', accentColor: '#5a3f24', shape: 'jar' },
  { name: 'Beef Jerky', brand: 'Crunch Time', description: 'Slow-smoked beef jerky, peppered and chewy.', category: 'Snacks', qualityTier: 'premium', costPrice: 2.6, retailPrice: 5.29, color: '#6a3f2a', accentColor: '#c0392b', shape: 'bag' },

  // Beverages
  { name: 'Soda', brand: 'PureSip', description: 'Classic cola, carbonated and ice-cold.', category: 'Beverages', qualityTier: 'budget', costPrice: 0.6, retailPrice: 1.79, color: '#c0392b', accentColor: '#9aa0a6', shape: 'can' },
  { name: 'Orange Juice', brand: 'Sunburst Beverages', description: 'Not-from-concentrate orange juice, pulp-free.', category: 'Beverages', qualityTier: 'standard', costPrice: 1.9, retailPrice: 3.79, color: '#e8862f', accentColor: '#e8862f', shape: 'bottle' },
  { name: 'Bottled Water', brand: 'Clearspring', description: 'Purified spring water in a resealable bottle.', category: 'Beverages', qualityTier: 'budget', costPrice: 0.4, retailPrice: 1.19, color: '#cfe8f0', accentColor: '#2f6fb0', shape: 'bottle' },
  { name: 'Sports Drink', brand: 'PureSip', description: 'Electrolyte sports drink in blue raspberry.', category: 'Beverages', qualityTier: 'standard', costPrice: 0.9, retailPrice: 2.19, color: '#3ec2e0', accentColor: '#3ec2e0', shape: 'bottle' },
  { name: 'Iced Tea', brand: 'Sunburst Beverages', description: 'Sweetened black tea, brewed and bottled cold.', category: 'Beverages', qualityTier: 'standard', costPrice: 1.0, retailPrice: 2.29, color: '#b5793a', accentColor: '#e8d23c', shape: 'bottle' },
  { name: 'Coffee', brand: 'Clearspring', description: 'Single-origin medium roast whole bean coffee.', category: 'Beverages', qualityTier: 'premium', costPrice: 4.2, retailPrice: 7.99, color: '#4a3222', accentColor: '#c0392b', shape: 'jar' },
  { name: 'Energy Drink', brand: 'PureSip', description: 'Caffeinated energy drink with a citrus kick.', category: 'Beverages', qualityTier: 'standard', costPrice: 1.1, retailPrice: 2.69, color: '#3f8a4f', accentColor: '#e8d23c', shape: 'can' },

  // Frozen
  { name: 'Frozen Pizza', brand: 'IceHouse Kitchen', description: 'Stone-baked pepperoni pizza, oven-ready.', category: 'Frozen', qualityTier: 'standard', costPrice: 2.8, retailPrice: 5.99, color: '#3f7fbf', accentColor: '#c0392b', shape: 'box' },
  { name: 'Ice Cream', brand: 'Frostline Foods', description: 'Rich vanilla bean ice cream, churned slow.', category: 'Frozen', qualityTier: 'premium', costPrice: 3.1, retailPrice: 5.79, color: '#f0b8c9', accentColor: '#fbfbf5', shape: 'jar' },
  { name: 'Frozen Vegetables', brand: 'Arctic Harvest', description: 'A steamable mix of peas, carrots, and corn.', category: 'Frozen', qualityTier: 'budget', costPrice: 1.4, retailPrice: 2.99, color: '#3f8a4f', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Frozen Waffles', brand: 'IceHouse Kitchen', description: 'Toaster-ready buttermilk waffles, eight pack.', category: 'Frozen', qualityTier: 'standard', costPrice: 1.7, retailPrice: 3.49, color: '#e8c23c', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Frozen Burritos', brand: 'IceHouse Kitchen', description: 'Microwaveable bean and cheese burritos.', category: 'Frozen', qualityTier: 'budget', costPrice: 2.0, retailPrice: 4.19, color: '#c0392b', accentColor: '#e8c23c', shape: 'box' },
  { name: 'Frozen Fish Fillets', brand: 'Arctic Harvest', description: 'Wild-caught cod fillets, individually frozen.', category: 'Frozen', qualityTier: 'premium', costPrice: 3.6, retailPrice: 6.99, color: '#e8e0d0', accentColor: '#2f6fb0', shape: 'box' },

  // Breakfast
  { name: 'Cereal', brand: 'Golden Grain Co.', description: 'Toasted corn flakes with a touch of honey.', category: 'Breakfast', qualityTier: 'standard', costPrice: 2.4, retailPrice: 4.99, color: '#e07a1f', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Oatmeal', brand: 'Morning Ritual', description: 'Old-fashioned rolled oats, ready in minutes.', category: 'Breakfast', qualityTier: 'budget', costPrice: 2.0, retailPrice: 3.99, color: '#c9a26a', accentColor: '#c0392b', shape: 'jar' },
  { name: 'Pancake Mix', brand: 'Sunrise Table', description: 'Just-add-water buttermilk pancake mix.', category: 'Breakfast', qualityTier: 'budget', costPrice: 1.6, retailPrice: 3.29, color: '#e8d23c', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Maple Syrup', brand: 'Sunrise Table', description: 'Pure amber maple syrup, tapped and bottled.', category: 'Breakfast', qualityTier: 'premium', costPrice: 2.9, retailPrice: 5.49, color: '#8a5a1f', accentColor: '#5a3a14', shape: 'bottle' },
  { name: 'Granola Bars', brand: 'Golden Grain Co.', description: 'Chewy oat-and-honey granola bars, six pack.', category: 'Breakfast', qualityTier: 'standard', costPrice: 2.2, retailPrice: 4.29, color: '#8a5a34', accentColor: '#4a8f4a', shape: 'box' },
  { name: 'Breakfast Sausage Links', brand: 'Morning Ritual', description: 'Savory pork sausage links, fully cooked.', category: 'Breakfast', qualityTier: 'standard', costPrice: 2.6, retailPrice: 4.99, color: '#8a4f3a', accentColor: '#c0392b', shape: 'box' },

  // Candy
  { name: 'Chocolate Bar', brand: 'SweetSpot', description: 'Smooth milk chocolate bar, snapped into squares.', category: 'Candy', qualityTier: 'standard', costPrice: 0.8, retailPrice: 1.99, color: '#4a2f1f', accentColor: '#c9a227', shape: 'box' },
  { name: 'Gummy Bears', brand: 'Rainbow Treats', description: 'Fruit-flavored gummy bears in five colors.', category: 'Candy', qualityTier: 'budget', costPrice: 0.9, retailPrice: 2.19, color: '#d94f8c', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Mints', brand: 'Confection Co.', description: 'Sugar-free peppermint mints, pocket tin.', category: 'Candy', qualityTier: 'standard', costPrice: 0.6, retailPrice: 1.59, color: '#eafaf0', accentColor: '#3f8a4f', shape: 'box' },
  { name: 'Lollipops', brand: 'Rainbow Treats', description: 'Assorted fruit lollipops on a stick.', category: 'Candy', qualityTier: 'budget', costPrice: 0.5, retailPrice: 1.29, color: '#e84f8c', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Candy Bag', brand: 'SweetSpot', description: 'A mixed bag of chewy fruit candies.', category: 'Candy', qualityTier: 'budget', costPrice: 1.1, retailPrice: 2.49, color: '#7a3fa0', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Licorice Twists', brand: 'Confection Co.', description: 'Classic red licorice twists, soft and chewy.', category: 'Candy', qualityTier: 'standard', costPrice: 0.9, retailPrice: 2.19, color: '#c0392b', accentColor: '#e8d23c', shape: 'bag' },

  // Household
  { name: 'Paper Towels', brand: 'CleanSweep', description: 'Extra-absorbent paper towels, six-roll pack.', category: 'Household', qualityTier: 'standard', costPrice: 2.6, retailPrice: 4.99, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Toilet Paper', brand: 'CleanSweep', description: 'Soft two-ply toilet paper, twelve rolls.', category: 'Household', qualityTier: 'standard', costPrice: 3.1, retailPrice: 5.99, color: '#f5f5f0', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Dish Soap', brand: 'TidyHouse', description: 'Grease-cutting dish soap, fresh lime scent.', category: 'Household', qualityTier: 'budget', costPrice: 1.3, retailPrice: 2.69, color: '#3f8a4f', accentColor: '#3f8a4f', shape: 'bottle' },
  { name: 'Laundry Detergent', brand: 'HomeBright', description: 'Concentrated laundry detergent, 50 loads.', category: 'Household', qualityTier: 'premium', costPrice: 4.2, retailPrice: 7.99, color: '#2f6fb0', accentColor: '#e08a1f', shape: 'bottle' },
  { name: 'Trash Bags', brand: 'CleanSweep', description: 'Heavy-duty kitchen trash bags, drawstring tie.', category: 'Household', qualityTier: 'standard', costPrice: 2.4, retailPrice: 4.79, color: '#3a3f47', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Sponges', brand: 'TidyHouse', description: 'Dual-sided scrub sponges, pack of six.', category: 'Household', qualityTier: 'budget', costPrice: 1.0, retailPrice: 2.19, color: '#e8d23c', accentColor: '#3f8a4f', shape: 'box' },
  { name: 'Air Freshener', brand: 'HomeBright', description: 'Long-lasting linen-scent air freshener spray.', category: 'Household', qualityTier: 'standard', costPrice: 1.6, retailPrice: 3.29, color: '#a0c9e0', accentColor: '#fbfbf5', shape: 'can' },

  // Health & Beauty
  { name: 'Toothpaste', brand: 'FreshStart', description: 'Whitening fluoride toothpaste, mint flavor.', category: 'Health & Beauty', qualityTier: 'standard', costPrice: 1.2, retailPrice: 2.59, color: '#2f6fb0', accentColor: '#c0392b', shape: 'bottle' },
  { name: 'Shampoo', brand: 'PureGlow', description: 'Moisturizing shampoo with argan oil.', category: 'Health & Beauty', qualityTier: 'standard', costPrice: 1.8, retailPrice: 3.59, color: '#3f8a4f', accentColor: '#fbfbf5', shape: 'bottle' },
  { name: 'Soap Bar', brand: 'DailyCare', description: 'Gentle moisturizing soap bar, unscented.', category: 'Health & Beauty', qualityTier: 'budget', costPrice: 0.7, retailPrice: 1.59, color: '#f0d8e0', accentColor: '#d94f8c', shape: 'box' },
  { name: 'Deodorant', brand: 'FreshStart', description: '48-hour antiperspirant deodorant stick.', category: 'Health & Beauty', qualityTier: 'standard', costPrice: 1.6, retailPrice: 3.19, color: '#2f6fb0', accentColor: '#fbfbf5', shape: 'bottle' },
  { name: 'Hand Lotion', brand: 'PureGlow', description: 'Fast-absorbing hand lotion with shea butter.', category: 'Health & Beauty', qualityTier: 'premium', costPrice: 1.4, retailPrice: 2.89, color: '#f0c9d8', accentColor: '#fbfbf5', shape: 'bottle' },
  { name: 'Razors', brand: 'DailyCare', description: 'Five-blade disposable razors, pack of four.', category: 'Health & Beauty', qualityTier: 'premium', costPrice: 2.4, retailPrice: 4.99, color: '#a0a8b0', accentColor: '#2f6fb0', shape: 'box' },

  // Canned & Pantry
  { name: 'Canned Soup', brand: 'Harvest Table', description: 'Chunky chicken noodle soup, ready to heat.', category: 'Pantry', qualityTier: 'budget', costPrice: 0.9, retailPrice: 1.99, color: '#c0392b', accentColor: '#fbfbf5', shape: 'can' },
  { name: 'Canned Beans', brand: 'Stapleworks', description: 'Slow-cooked black beans in a light sauce.', category: 'Pantry', qualityTier: 'budget', costPrice: 0.8, retailPrice: 1.79, color: '#8a5a2f', accentColor: '#e8d23c', shape: 'can' },
  { name: 'Pasta', brand: 'Old Mill Co.', description: 'Durum wheat penne pasta, bronze-cut.', category: 'Pantry', qualityTier: 'budget', costPrice: 1.0, retailPrice: 2.19, color: '#2f6fb0', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Rice', brand: 'Old Mill Co.', description: 'Long-grain white rice, five-pound bag.', category: 'Pantry', qualityTier: 'budget', costPrice: 1.6, retailPrice: 3.29, color: '#f5f5f0', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Peanut Butter', brand: 'Harvest Table', description: 'Creamy peanut butter, no added sugar.', category: 'Pantry', qualityTier: 'standard', costPrice: 1.9, retailPrice: 3.79, color: '#c9a26a', accentColor: '#c0392b', shape: 'jar' },
  { name: 'Tomato Sauce', brand: 'Stapleworks', description: 'Slow-simmered tomato sauce with basil.', category: 'Pantry', qualityTier: 'standard', costPrice: 1.1, retailPrice: 2.29, color: '#b5322f', accentColor: '#3f8a4f', shape: 'jar' },
  { name: 'Olive Oil', brand: 'Old Mill Co.', description: 'Cold-pressed extra virgin olive oil.', category: 'Pantry', qualityTier: 'premium', costPrice: 3.6, retailPrice: 6.99, color: '#3f5a2f', accentColor: '#c9a227', shape: 'bottle' },
  { name: 'Ketchup', brand: 'Harvest Table', description: 'Classic tomato ketchup, squeeze bottle.', category: 'Pantry', qualityTier: 'budget', costPrice: 1.3, retailPrice: 2.59, color: '#c0392b', accentColor: '#2f6fb0', shape: 'bottle' },

  // Meat & Deli
  { name: 'Chicken Breast', brand: "Butcher's Choice", description: 'Boneless skinless chicken breast, fresh cut.', category: 'Meat & Deli', qualityTier: 'standard', costPrice: 3.8, retailPrice: 6.99, color: '#f0c9c0', accentColor: '#c0392b', shape: 'box' },
  { name: 'Ground Beef', brand: 'Farmhouse Deli', description: '85/15 ground beef, ground fresh in-store.', category: 'Meat & Deli', qualityTier: 'standard', costPrice: 3.4, retailPrice: 6.29, color: '#b5453a', accentColor: '#fbfbf5', shape: 'box' },
  { name: 'Bacon', brand: 'Prime Cut Co.', description: 'Applewood-smoked bacon, thick cut.', category: 'Meat & Deli', qualityTier: 'premium', costPrice: 2.9, retailPrice: 5.49, color: '#c9645a', accentColor: '#2f6fb0', shape: 'box' },
  { name: 'Deli Ham', brand: 'Farmhouse Deli', description: 'Honey-glazed deli ham, sliced to order.', category: 'Meat & Deli', qualityTier: 'standard', costPrice: 2.6, retailPrice: 4.99, color: '#e0a0a8', accentColor: '#c0392b', shape: 'box' },
  { name: 'Sausage', brand: "Butcher's Choice", description: 'Bratwurst sausage links, four to a pack.', category: 'Meat & Deli', qualityTier: 'standard', costPrice: 2.4, retailPrice: 4.69, color: '#8a4f3a', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Turkey Slices', brand: 'Prime Cut Co.', description: 'Oven-roasted turkey breast, deli sliced.', category: 'Meat & Deli', qualityTier: 'premium', costPrice: 3.0, retailPrice: 5.79, color: '#e8c9a0', accentColor: '#c0392b', shape: 'box' },

  // Baby
  { name: 'Diapers', brand: 'LittleSteps', description: 'Overnight-dry diapers with a wetness indicator.', category: 'Baby', qualityTier: 'standard', costPrice: 5.4, retailPrice: 9.99, color: '#fbfbf5', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Baby Wipes', brand: 'GentleStart', description: 'Fragrance-free baby wipes, extra thick.', category: 'Baby', qualityTier: 'standard', costPrice: 1.4, retailPrice: 2.79, color: '#fbfbf5', accentColor: '#3ec2e0', shape: 'box' },
  { name: 'Baby Formula', brand: 'TinyTots', description: 'Infant milk-based formula with added iron.', category: 'Baby', qualityTier: 'premium', costPrice: 6.2, retailPrice: 11.49, color: '#f0e0a0', accentColor: '#2f6fb0', shape: 'jar' },
  { name: 'Baby Food Jar', brand: 'TinyTots', description: 'Pureed sweet potato baby food, single serve.', category: 'Baby', qualityTier: 'standard', costPrice: 0.7, retailPrice: 1.49, color: '#e8862f', accentColor: '#fbfbf5', shape: 'jar' },
  { name: 'Baby Shampoo', brand: 'GentleStart', description: 'Tear-free baby shampoo and wash, lavender.', category: 'Baby', qualityTier: 'premium', costPrice: 1.8, retailPrice: 3.49, color: '#e0d8f0', accentColor: '#8a4fb0', shape: 'bottle' },

  // Pet
  { name: 'Dog Food Bag', brand: 'Loyal Companion', description: 'Chicken and rice dry dog food, all life stages.', category: 'Pet', qualityTier: 'standard', costPrice: 4.8, retailPrice: 8.99, color: '#8a5a2f', accentColor: '#c0392b', shape: 'bag' },
  { name: 'Cat Food Can', brand: 'Happy Tails', description: 'Wet cat food in gravy, tuna flavor.', category: 'Pet', qualityTier: 'budget', costPrice: 0.7, retailPrice: 1.49, color: '#7a3fa0', accentColor: '#c9a227', shape: 'can' },
  { name: 'Pet Treats', brand: 'Loyal Companion', description: 'Crunchy training treats for dogs, bacon flavor.', category: 'Pet', qualityTier: 'standard', costPrice: 1.6, retailPrice: 3.29, color: '#e8862f', accentColor: '#2f6fb0', shape: 'bag' },
  { name: 'Cat Litter', brand: 'PetPantry', description: 'Clumping clay cat litter with odor control.', category: 'Pet', qualityTier: 'standard', costPrice: 3.4, retailPrice: 6.49, color: '#c9c0b0', accentColor: '#2f6fb0', shape: 'bag' },

  // Electronics
  { name: 'Batteries 4-Pack', brand: 'VoltEdge', description: 'Long-life AA alkaline batteries, four pack.', category: 'Electronics', qualityTier: 'standard', costPrice: 1.5, retailPrice: 3.49, color: '#2f6fb0', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Phone Charger', brand: 'ChargeUp', description: 'Fast-charging USB-C cable and wall adapter.', category: 'Electronics', qualityTier: 'standard', costPrice: 3.0, retailPrice: 6.99, color: '#3a3f47', accentColor: '#3ec2e0', shape: 'box' },
  { name: 'Earbuds', brand: 'CircuitPro', description: 'Wireless earbuds with a compact charging case.', category: 'Electronics', qualityTier: 'premium', costPrice: 5.0, retailPrice: 11.99, color: '#fbfbf5', accentColor: '#3a3f47', shape: 'box' },
  { name: 'Power Bank', brand: 'ChargeUp', description: '10,000mAh portable battery pack, dual USB.', category: 'Electronics', qualityTier: 'premium', costPrice: 8.0, retailPrice: 16.99, color: '#3a3f47', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Light Bulbs', brand: 'VoltEdge', description: 'LED light bulbs, soft white, four pack.', category: 'Electronics', qualityTier: 'budget', costPrice: 2.0, retailPrice: 4.49, color: '#e8d23c', accentColor: '#fbfbf5', shape: 'bag' },

  // Seasonal & Party
  { name: 'Birthday Candles', brand: 'Celebrate Co.', description: 'Rainbow spiral birthday candles, pack of twenty-four.', category: 'Seasonal & Party', qualityTier: 'budget', costPrice: 0.8, retailPrice: 1.99, color: '#e84f8c', accentColor: '#e8d23c', shape: 'box' },
  { name: 'Party Balloons', brand: 'PartyBox', description: 'Assorted latex balloons, fifty-count bag.', category: 'Seasonal & Party', qualityTier: 'budget', costPrice: 1.2, retailPrice: 2.99, color: '#3ec2e0', accentColor: '#e84f8c', shape: 'bag' },
  { name: 'Gift Wrap Roll', brand: 'FestiveFinds', description: 'Glossy gift wrap roll, all-occasion print.', category: 'Seasonal & Party', qualityTier: 'standard', costPrice: 1.5, retailPrice: 3.29, color: '#c0392b', accentColor: '#e8d23c', shape: 'bag' },
  { name: 'Greeting Card', brand: 'FestiveFinds', description: 'A hand-illustrated greeting card with envelope.', category: 'Seasonal & Party', qualityTier: 'standard', costPrice: 0.9, retailPrice: 2.49, color: '#fbfbf5', accentColor: '#7a3fa0', shape: 'box' },
  { name: 'Wrapping Bow', brand: 'PartyBox', description: 'Self-stick curling ribbon bow, gift-ready.', category: 'Seasonal & Party', qualityTier: 'budget', costPrice: 0.5, retailPrice: 1.29, color: '#e8d23c', accentColor: '#c0392b', shape: 'bag' },
]
// clang-format on

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => ({ id: slugify(p.name), ...p }))

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export const PRODUCT_CATEGORIES: string[] = Array.from(new Set(PRODUCTS.map((p) => p.category)))

export const QUALITY_TIER_LABELS: Record<QualityTier, string> = {
  budget: 'Budget',
  standard: 'Standard',
  premium: 'Premium',
}

export const SHELF_CAPACITY = 20
export const STOCKROOM_CAPACITY = 400

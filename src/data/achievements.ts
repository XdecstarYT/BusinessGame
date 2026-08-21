export interface AchievementDefinition {
  id: string
  label: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-profitable-day', label: 'In the Black', description: 'Close out your first profitable day.', icon: '💵' },
  { id: 'fully-stocked-store', label: 'Fully Stocked', description: 'Every shelf in your store holds product.', icon: '📦' },
  { id: 'second-location', label: 'Expanding the Empire', description: 'Acquire a second location on the City Map.', icon: '🏙️' },
  { id: 'first-franchise', label: 'Franchise Pioneer', description: 'License your first franchisee.', icon: '🤝' },
  { id: 'public-offering', label: 'Going Public', description: 'Take your company public with an IPO.', icon: '🔔' },
  { id: 'loyal-following', label: 'Loyal Following', description: 'Enroll 100 members in your loyalty program.', icon: '💳' },
  { id: 'goal-crusher', label: 'Goal Crusher', description: 'Complete 3 weekly goals.', icon: '🎯' },
  { id: 'green-thumb', label: 'Green Thumb', description: 'Decorate your store with a plant.', icon: '🪴' },
  { id: 'storm-survivor', label: 'Storm Survivor', description: 'Keep the store running through stormy weather.', icon: '⛈️' },
]

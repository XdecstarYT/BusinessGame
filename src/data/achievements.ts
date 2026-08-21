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
]

export interface Neighborhood {
  id: string
  name: string
  description: string
  demographic: string
  /** 0-100 flavor stat, cosmetic only — does not yet drive a live second-store simulation. */
  footTraffic: number
  acquisitionCost: number
  /** Toy-town map coordinates (world units), unrelated to the store's build grid. */
  position: [number, number]
  color: string
}

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'downtown',
    name: 'Downtown Core',
    description: 'Dense sidewalk traffic and lunchtime rushes, but premium rent to match.',
    demographic: 'Office workers & tourists',
    footTraffic: 92,
    acquisitionCost: 45000,
    position: [0, 0],
    color: '#f59e0b',
  },
  {
    id: 'suburbs',
    name: 'Maple Suburbs',
    description: 'Quiet residential streets with loyal weekly regulars.',
    demographic: 'Families',
    footTraffic: 55,
    acquisitionCost: 18000,
    position: [26, 0],
    color: '#34d399',
  },
  {
    id: 'college',
    name: 'College Row',
    description: 'Budget-conscious students and big between-class rushes.',
    demographic: 'Students',
    footTraffic: 70,
    acquisitionCost: 22000,
    position: [-26, 0],
    color: '#60a5fa',
  },
  {
    id: 'waterfront',
    name: 'Waterfront District',
    description: 'Seasonal tourist swings that can support premium pricing.',
    demographic: 'Tourists & locals',
    footTraffic: 65,
    acquisitionCost: 38000,
    position: [0, 26],
    color: '#22d3ee',
  },
  {
    id: 'industrial',
    name: 'Industrial Flats',
    description: 'Cheap rent with sparse but dependable foot traffic.',
    demographic: 'Warehouse workers',
    footTraffic: 30,
    acquisitionCost: 9000,
    position: [0, -26],
    color: '#a78bfa',
  },
  {
    id: 'uptown',
    name: 'Uptown Heights',
    description: 'Affluent shoppers with high spend per visit.',
    demographic: 'Professionals',
    footTraffic: 48,
    acquisitionCost: 52000,
    position: [26, 26],
    color: '#f472b6',
  },
  {
    id: 'oldtown',
    name: 'Old Town Square',
    description: 'Historic charm that draws steady weekend crowds.',
    demographic: 'Weekend visitors',
    footTraffic: 58,
    acquisitionCost: 26000,
    position: [-26, 26],
    color: '#fb923c',
  },
]

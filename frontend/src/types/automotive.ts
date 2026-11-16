export interface AutomotiveComponent {
  id: string
  name: string
  category: 'body' | 'glass' | 'lighting' | 'wheels' | 'brakes' | 'other'
  meshNames: string[]
}
export interface AutomotiveComponent {
  id: string
  name: string
  category: 'body' | 'glass' | 'lighting' | 'wheels' | 'brakes' | 'other'
  meshNames: string[]
}

export interface ComponentTechnicalInfo {
  description: string
  function: string
  material?: string
  maintenance?: string[]
  oemPartNumber?: string
  compatibilityNotes?: string
}

export interface AutomotiveComponent {
  id: string
  name: string
  category:
    | 'body'
    | 'glass'
    | 'lighting'
    | 'wheels'
    | 'brakes'
    | 'other'
  meshNames: string[]
  technicalInfo?: ComponentTechnicalInfo
}


import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import type { AutomotiveComponent } from '../types/automotive'

export function createComponentLabel(
  component: AutomotiveComponent
): CSS2DObject {
  const element = document.createElement('div')

  element.className = 'component-label'
  element.textContent = component.name

  element.style.cssText = `
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid #64748b;
    color: white;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
  `

  const label = new CSS2DObject(element)
  label.name = `label-${component.id}`

  return label
}

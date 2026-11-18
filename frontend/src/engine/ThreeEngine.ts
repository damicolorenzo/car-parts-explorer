
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'

export class ThreeEngine {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  readonly labelRenderer: CSS2DRenderer
  readonly controls: OrbitControls

  private readonly container: HTMLDivElement
  private resizeObserver: ResizeObserver
  private animationId = 0
  private disposed = false
  private readonly grid: THREE.GridHelper

  constructor(container: HTMLDivElement) {
    this.container = container
    
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x101827)

    this.camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      1000
    )
    this.camera.position.set(6, 4, 6)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    )
    this.renderer.setSize(width, height)
    this.renderer.shadowMap.enabled = true

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(width, height)

    const labelElement = this.labelRenderer.domElement
    labelElement.style.position = 'absolute'
    labelElement.style.top = '0'
    labelElement.style.left = '0'
    labelElement.style.zIndex = '1'
    labelElement.style.pointerEvents = 'none'

    container.appendChild(this.renderer.domElement)
    container.appendChild(labelElement)

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.controls.enableDamping = true
    this.controls.target.set(0, 1, 0)
    this.controls.update()

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5))

    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(5, 10, 5)
    light.castShadow = true
    this.scene.add(light)

    this.grid = new THREE.GridHelper(
      20, 20, 0x475569, 0x334155
    )
    this.scene.add(this.grid)

    this.resizeObserver = new ResizeObserver(() => {
      this.resize()
    })
    this.resizeObserver.observe(container)
  }

  resize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    if (width <= 0 || height <= 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.labelRenderer.setSize(width, height)
  }

  start(onFrame?: () => void): void {
    if (this.disposed || this.animationId !== 0) return

    const animate = () => {
      if (this.disposed) return

      this.animationId = requestAnimationFrame(animate)

      onFrame?.()
      this.controls.update()

      this.renderer.render(this.scene, this.camera)
      this.labelRenderer.render(this.scene, this.camera)
    }

    animate()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    cancelAnimationFrame(this.animationId)
    this.animationId = 0
    this.resizeObserver.disconnect()

    this.controls.dispose()

    this.scene.remove(this.grid)
    this.grid.geometry.dispose()

    const materials = Array.isArray(this.grid.material)
      ? this.grid.material
      : [this.grid.material]

    materials.forEach(material => material.dispose())

    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }
}


import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  getAssemblies,
  resolveViewerMesh,
} from '../componentCatalogApi'

describe('Component Catalog API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches the assembly catalog', async () => {
    const assemblies = [
      {
        id: 'assembly-1',
        code: 'BRAKE_SYSTEM',
        name: 'Brake System',
        description: 'Disc brake assembly',
      },
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => assemblies,
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await getAssemblies()

    expect(result).toEqual(assemblies)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/assemblies',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('resolves a Three.js mesh to its component', async () => {
    const response = {
      viewerModelId: 'brake-assembly',
      meshName: 'brake-disc',
      component: {
        id: 'component-1',
        assemblyId: 'assembly-1',
        code: 'BRAKE_DISC',
        name: 'Brake Disc',
        description: 'Rotating friction disc',
        functionDescription: 'Generates braking friction',
        material: 'Cast iron',
      },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => response,
      }),
    )

    const result = await resolveViewerMesh(
      'brake-assembly',
      'brake-disc',
    )

    expect(result.component.code).toBe('BRAKE_DISC')
    expect(result.component.name).toBe('Brake Disc')
  })

  it('encodes mesh identifiers correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    vi.stubGlobal('fetch', fetchMock)

    await resolveViewerMesh('brake assembly', 'disc & hub')

    expect(fetchMock.mock.calls[0][0]).toContain(
      'viewerModelId=brake+assembly',
    )

    expect(fetchMock.mock.calls[0][0]).toContain(
      'meshName=disc+%26+hub',
    )
  })

  it('throws ApiError when a mesh is not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    await expect(
      resolveViewerMesh('brake-assembly', 'unknown-mesh'),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('preserves the HTTP status on API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    await expect(
      getAssemblies(),
    ).rejects.toMatchObject({
      status: 503,
    })
  })
})

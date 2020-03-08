import React from 'react'
import { render, act } from '@testing-library/react'
import { AzureMapsContext } from '../../contexts/AzureMapContext'
import AzureMap from './AzureMap'
import { Map } from 'azure-maps-control'
import { IAzureMap, IAzureMapsContextProps } from '../../types'
import { useCreateImageSprites } from './useCreateSprites'
import { useCreateMapControls, useCreateMapCustomControls } from './useCreateMapControls'

const LoaderComponent = () => <div>Loader</div>

jest.mock('./useCreateSprites')
jest.mock('./useCreateMapControls')
jest.mock('guid-typescript', () => {
  return {
    Guid: {
      create: jest.fn(() => 'fake_generated_id')
    }
  }
})

const mapContextProps = {
  mapRef: null,
  isMapReady: false,
  setMapReady: jest.fn(),
  removeMapRef: jest.fn(),
  setMapRef: jest.fn()
}

const wrapWithAzureMapContext = (mapContextProps: IAzureMapsContextProps, mapProps: IAzureMap) => {
  return (
    <AzureMapsContext.Provider
      value={{
        ...mapContextProps
      }}
    >
      <AzureMap {...mapProps} />
    </AzureMapsContext.Provider>
  )
}

describe('AzureMap Component', () => {
  beforeEach(() => {
    mapContextProps.removeMapRef.mockClear()
    mapContextProps.setMapReady.mockClear()
    mapContextProps.setMapRef.mockClear()
  })

  it('should setMapRef on mount', () => {
    act(() => {
      render(wrapWithAzureMapContext(mapContextProps, {}))
    })
    expect(mapContextProps.setMapRef).toHaveBeenCalled()
  })

  it('should change trafficOptions call setTraffic from mapRef', () => {
    const mapRef = new Map('fake', {})
    act(() => {
      const { rerender } = render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, {}))
      rerender(
        wrapWithAzureMapContext(
          { ...mapContextProps, mapRef },
          { trafficOptions: { some: 'some2' } }
        )
      )
    })
    expect(mapRef.setTraffic).toHaveBeenCalledWith({ some: 'some2' })
  })

  it('should change userInteraction call setUserInteraction from mapRef', () => {
    const mapRef = new Map('fake', {})
    act(() => {
      const { rerender } = render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, {}))
      rerender(
        wrapWithAzureMapContext(
          { ...mapContextProps, mapRef },
          { userInteraction: { some: 'some2' } }
        )
      )
    })
    expect(mapRef.setUserInteraction).toHaveBeenCalledWith({ some: 'some2' })
  })

  it('should change cameraOptions call setCamera from mapRef', () => {
    const mapRef = new Map('fake', {})
    act(() => {
      const { rerender } = render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, {}))
      rerender(
        wrapWithAzureMapContext(
          { ...mapContextProps, mapRef },
          { cameraOptions: { some: 'some2' } }
        )
      )
    })
    expect(mapRef.setCamera).toHaveBeenCalledWith({ some: 'some2' })
  })

  it('should call removeMapRef on unmount of component', () => {
    const mapRef = new Map('fake', {})
    const { unmount } = render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, {}))
    unmount()
    expect(mapContextProps.removeMapRef).toHaveBeenCalled()
  })

  it('should call useCreateImageSprites if imageSprites is not falsy', () => {
    const mapRef = new Map('fake', {})
    render(
      wrapWithAzureMapContext(
        { ...mapContextProps, mapRef },
        { imageSprites: [{ id: 'some_fake_id' }] }
      )
    )
    expect(useCreateImageSprites).toHaveBeenCalled()
  })

  it('should call useCreateMapControls if controls is not falsy', () => {
    const mapRef = new Map('fake', {})
    const fakeControls = [{ controlName: 'fake_control_name' }]
    render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, { controls: fakeControls }))
    expect(useCreateMapControls).toHaveBeenCalledWith(expect.any(Object), fakeControls)
  })

  it('should call useCreateMapCustomControls if customControls is not falsy', () => {
    const mapRef = new Map('fake', {})
    const customControls = [
      {
        control: { onAdd: jest.fn(), onRemove: jest.fn() },
        controlOptions: {}
      }
    ]
    render(
      wrapWithAzureMapContext(
        { ...mapContextProps, mapRef },
        {
          customControls
        }
      )
    )
    expect(useCreateMapCustomControls).toHaveBeenCalledWith(expect.any(Object), customControls)
  })

  it('should call setMapready on mount of component', () => {
    const mapRef = new Map('fake', {})
    render(wrapWithAzureMapContext({ ...mapContextProps, mapRef }, {}))
    expect(mapContextProps.setMapReady).toHaveBeenCalledWith(true)
  })

  it('should add props events to mapRef', () => {
    const mapRef = new Map('fake', { options: {} })
    const dataCallback = () => {
      console.log('some fake text')
    }
    render(
      wrapWithAzureMapContext(
        { ...mapContextProps, mapRef },
        {
          events: {
            data: dataCallback
          }
        }
      )
    )
    expect(mapRef.events.add).toHaveBeenCalledWith('ready', expect.any(Function))
    expect(mapRef.events.add).toHaveBeenCalledWith('data', dataCallback)
  })

  it('should render LoaderComponent if isMapReady is false and LoaderComponent exists', async () => {
    const mapRef = new Map('fake', { options: {} })
    const { findByText } = render(
      wrapWithAzureMapContext(
        { ...mapContextProps, mapRef },
        {
          LoaderComponent
        }
      )
    )
    const loaderElement = await findByText('Loader')
    expect(loaderElement).toMatchSnapshot()
  })

  it('should create map with div and automatically generated id when if isMapReady is true and LoaderComponent exists', async () => {
    const mapRef = new Map('fake', { options: {} })
    const { container } = render(
      wrapWithAzureMapContext({ ...mapContextProps, mapRef, isMapReady: true }, {})
    )
    expect(container).toMatchSnapshot()
  })

  it('should render map with div and provvided id when if isMapReady is true and LoaderComponent exists', async () => {
    const mapRef = new Map('fake', { options: {} })
    const { container } = render(
      wrapWithAzureMapContext(
        { ...mapContextProps, mapRef, isMapReady: true },
        {
          LoaderComponent,
          providedMapId: 'some_fake_map_id'
        }
      )
    )
    expect(container).toMatchSnapshot()
  })

  afterAll(() => {
    jest.unmock('./useCreateSprites')
    jest.unmock('./useCreateMapControls')
    jest.unmock('guid-typescript')
  })
})
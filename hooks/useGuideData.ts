// Hook personalizado para manejar datos de guías del viajero
// Integrado con Supabase y multi-tenant

import { useState, useEffect } from 'react'
import { getCompleteGuideData } from '@/lib/api/guides-client'
import { getCompleteGuideDataPublic } from '@/lib/api/guides-public'
import type { CompleteGuideDataResponse } from '@/types/guides'

interface UseGuideDataReturn {
  data: CompleteGuideDataResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGuideData(propertyId: string): UseGuideDataReturn {
  const [data, setData] = useState<CompleteGuideDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!propertyId) {
      console.log('No property ID provided')
      setError('Property ID is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching guide data for property:', propertyId)
      let guideData = await getCompleteGuideData(propertyId)

      // Fallback a cliente público si no hay sesión o la guía es pública
      if (!guideData) {
        console.log('Falling back to public guide fetcher')
        guideData = await getCompleteGuideDataPublic(propertyId) as any
      }
      
      if (guideData) {
        console.log('Guide data loaded successfully:', guideData)
        setData(guideData)
      } else {
        console.log('No guide data found for property:', propertyId)
        setError('No guide found for this property')
      }
    } catch (err) {
      console.error('Error fetching guide data:', err)
      setError(err instanceof Error ? err.message : 'Error fetching guide data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [propertyId])

  const refetch = async () => {
    await fetchData()
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}

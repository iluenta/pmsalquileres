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

      console.log('Fetching guide data via secure API for property:', propertyId)

      // Intentar obtener el token de sesión de las cookies
      const cookieName = `guide_guest_${propertyId}_session`
      const cookies = document.cookie.split(';')
      const sessionField = cookies.find(c => c.trim().startsWith(`${cookieName}=`))
      const sessionToken = sessionField ? sessionField.split('=')[1].trim() : ''

      const response = await fetch(`/api/public/guides/data?propertyId=${propertyId}&session=${sessionToken}`)

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`)
      }

      const guideData = await response.json()

      if (guideData && !guideData.error) {
        console.log('Guide data loaded successfully:', guideData)
        setData(guideData)
      } else {
        console.log('No guide data found for property:', propertyId)
        setError(guideData?.error || 'No guide found for this property')
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

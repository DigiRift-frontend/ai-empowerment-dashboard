'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { CertificateList } from '@/components/certificates/certificate-list'
import { Award, Loader2, Download, FileCheck } from 'lucide-react'
import type { Certificate, SchulungSerie } from '@/types'

export default function ZertifikatePage() {
  const { customerId } = useAuth()
  const [certificates, setCertificates] = useState<(Certificate & { serie?: SchulungSerie; customer?: { companyName: string } })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!customerId) return

      try {
        const res = await fetch(`/api/customers/${customerId}/certificates`)
        if (res.ok) {
          const data = await res.json()
          setCertificates(data)
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificates()
  }, [customerId])

  // Group certificates by series
  const certificatesBySeries = certificates.reduce((acc, cert) => {
    const serieTitle = cert.serie?.title || 'Einzelschulung'
    if (!acc[serieTitle]) {
      acc[serieTitle] = []
    }
    acc[serieTitle].push(cert)
    return acc
  }, {} as Record<string, typeof certificates>)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Zertifikate"
        subtitle="Ihre Nachweise"
      />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {/* Info Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-amber-200 p-3">
                  <Award className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Ihre Teilnahmezertifikate
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Hier finden Sie alle Zertifikate, die nach Abschluss von Schulungsserien
                    ausgestellt wurden. Jedes Zertifikat enthält einen einzigartigen
                    Verifizierungscode zur Echtheitsprüfung.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Empty State */}
          {certificates.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Noch keine Zertifikate
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Nach Abschluss einer Schulungsserie werden hier Ihre
                  Teilnahmezertifikate angezeigt.
                </p>
              </div>
            </Card>
          )}

          {/* Certificates by Series */}
          {Object.entries(certificatesBySeries).map(([serieTitle, certs]) => (
            <Card key={serieTitle} className="mb-4 overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{serieTitle}</h3>
                      <p className="text-xs text-gray-500">
                        {certs.length} Zertifikat{certs.length !== 1 ? 'e' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <CertificateList certificates={certs} showSerieTitle={false} />
              </div>
            </Card>
          ))}

          {/* Download Hint */}
          {certificates.length > 0 && (
            <div className="text-center mt-6 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                <span>Klicken Sie auf das Download-Symbol, um ein Zertifikat als PDF herunterzuladen.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

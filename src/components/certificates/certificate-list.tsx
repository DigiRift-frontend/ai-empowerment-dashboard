'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CertificateDownload } from './certificate-download'
import { Award, Calendar, Download, Hash, User } from 'lucide-react'
import type { Certificate, SchulungSerie } from '@/types'

interface CertificateListProps {
  certificates: (Certificate & {
    serie?: SchulungSerie
    customer?: { companyName: string }
  })[]
  showSerieTitle?: boolean
}

export function CertificateList({ certificates, showSerieTitle = true }: CertificateListProps) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Noch keine Zertifikate vorhanden</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {certificates.map((certificate) => (
        <Card key={certificate.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-amber-600" />
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {certificate.participantName}
                  </span>
                  {showSerieTitle && certificate.serie && (
                    <Badge variant="outline" className="text-xs">
                      {certificate.serie.title}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(certificate.issuedAt).toLocaleDateString('de-DE')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {certificate.hash}
                  </span>
                  {certificate.downloadCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {certificate.downloadCount}x
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <CertificateDownload certificate={certificate} variant="icon" />
          </div>
        </Card>
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import type { Certificate, SchulungSerie } from '@/types'

interface CertificateDownloadProps {
  certificate: Certificate & {
    serie?: SchulungSerie
    customer?: {
      companyName: string
      advisor?: {
        id: string
        name: string
        role: string
      }
    }
  }
  variant?: 'button' | 'icon'
  size?: 'sm' | 'default' | 'lg'
}

// DigiRift Logo as base64 (will be loaded dynamically)
async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/blue_cropped.png')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function CertificateDownload({
  certificate,
  variant = 'button',
  size = 'default',
}: CertificateDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Load logo
      const logoBase64 = await loadLogoAsBase64()

      // Create PDF document (A4 landscape for certificate look)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const centerX = pageWidth / 2

      // Colors
      const primaryColor = [0, 82, 147] as [number, number, number] // DigiRift Blue
      const darkColor = [31, 41, 55] as [number, number, number] // Gray-800
      const lightColor = [107, 114, 128] as [number, number, number] // Gray-500
      const goldColor = [217, 119, 6] as [number, number, number] // Amber-600

      // Background border
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(3)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      // Inner decorative border
      doc.setLineWidth(0.5)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

      // Add Logo at top
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', centerX - 25, 22, 50, 15)
        } catch (e) {
          // Fallback to text if image fails
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.setTextColor(...primaryColor)
          doc.text('DigiRift', centerX, 32, { align: 'center' })
        }
      } else {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(...primaryColor)
        doc.text('DigiRift', centerX, 32, { align: 'center' })
      }

      // Certificate title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(36)
      doc.setTextColor(...darkColor)
      doc.text('ZERTIFIKAT', centerX, 55, { align: 'center' })

      // Decorative line under title
      doc.setFillColor(...goldColor)
      doc.rect(centerX - 40, 60, 80, 1.5, 'F')

      // Confirmation text
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(...lightColor)
      doc.text('Hiermit bestätigen wir, dass', centerX, 75, { align: 'center' })

      // Participant name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(...darkColor)
      doc.text(certificate.participantName.toUpperCase(), centerX, 90, { align: 'center' })

      // Participation text
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(...lightColor)
      doc.text('erfolgreich am Workshop teilgenommen hat:', centerX, 102, { align: 'center' })

      // Workshop title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(...primaryColor)
      const serieTitle = certificate.serie?.title || 'KI-Kompetenz-Workshop'
      doc.text(serieTitle, centerX, 115, { align: 'center' })

      // Certificate title (EU regulation)
      if (certificate.serie?.certificateTitle) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(...lightColor)
        doc.text(certificate.serie.certificateTitle, centerX, 123, { align: 'center' })
      }

      // Decorative line
      doc.setFillColor(...lightColor)
      doc.rect(centerX - 50, 130, 100, 0.5, 'F')

      // Competencies acquired
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...darkColor)
      doc.text('Erworbene Kompetenzen:', centerX, 140, { align: 'center' })

      const competencies = [
        'KI-Grundlagen & Funktionsverständnis',
        'Recht, Compliance & KI-Verantwortung (EU-AI-Act)',
        'Ethik, Sicherheit & verantwortungsvolle Nutzung',
        'Praktische KI-Anwendung im Arbeitsalltag',
      ]

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      competencies.forEach((comp, index) => {
        doc.text(`• ${comp}`, centerX, 148 + index * 5, { align: 'center' })
      })

      // Footer section - Left side (Issue info)
      const footerY = pageHeight - 40

      // Issue date
      const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      doc.setFontSize(9)
      doc.setTextColor(...lightColor)
      doc.text(`Ausgestellt am: ${issuedDate}`, 25, footerY)

      // Company name
      if (certificate.customer?.companyName) {
        doc.text(`Unternehmen: ${certificate.customer.companyName}`, 25, footerY + 5)
      }

      // Verification hash
      doc.setFont('helvetica', 'bold')
      doc.text(`Verifizierungscode: ${certificate.hash}`, 25, footerY + 10)

      // Footer section - Right side (Signature/DigiRift info)
      const rightX = pageWidth - 25

      // DigiRift company info
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...primaryColor)
      doc.text('DigiRift GmbH', rightX, footerY, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...lightColor)
      doc.text('Rothenbaumchaussee 17', rightX, footerY + 5, { align: 'right' })
      doc.text('20148 Hamburg', rightX, footerY + 9, { align: 'right' })

      // Advisor (Customer Success Manager)
      const advisorName = certificate.customer?.advisor?.name || 'Customer Success Team'
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.text(advisorName, rightX, footerY + 16, { align: 'right' })
      doc.text('Customer Success Manager', rightX, footerY + 20, { align: 'right' })

      // Bottom decoration
      doc.setFillColor(...primaryColor)
      doc.rect(centerX - 60, pageHeight - 15, 120, 2, 'F')

      // Save PDF
      const fileName = `Zertifikat_${certificate.participantName.replace(/\s+/g, '_')}_${certificate.hash}.pdf`
      doc.save(fileName)

      // Increment download counter
      try {
        await fetch(`/api/certificates?hash=${certificate.hash}`, {
          method: 'PATCH',
        })
      } catch (e) {
        // Silent fail for counter
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
        title="Zertifikat herunterladen"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </button>
    )
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      size={size}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isGenerating ? 'Generiere...' : 'Zertifikat herunterladen'}
    </Button>
  )
}

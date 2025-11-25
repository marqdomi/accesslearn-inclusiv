import { Button } from '@/components/ui/button'
import { DownloadSimple } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface ExportButtonProps {
    data: any[]
    filename: string
    headers: string[]
}

export function ExportButton({ data, filename, headers }: ExportButtonProps) {
    const { t } = useTranslation()

    const exportToCSV = () => {
        if (!data || data.length === 0) {
            return
        }

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header]
                    // Escape commas and quotes in values
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value ?? ''
                }).join(',')
            )
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <DownloadSimple size={18} />
            {t('analytics.export') || 'Export CSV'}
        </Button>
    )
}

import XLSX from "xlsx"

export class ExcelReportGenerator {
  static generate(report) {
    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data for Excel
    const excelData = []

    // Add title and subtitle
    if (report.title) {
      excelData.push([report.title])
      excelData.push([])
    }

    if (report.subtitle) {
      excelData.push([report.subtitle])
      excelData.push([])
    }

    // Add filters
    if (Object.keys(report.filters).length > 0) {
      excelData.push(["Filtros aplicados:"])
      for (const [key, value] of Object.entries(report.filters)) {
        if (value) {
          excelData.push([`${key}: ${value}`])
        }
      }
      excelData.push([])
    }

    // Add metadata
    if (report.metadata.totalRecords) {
      excelData.push([`Total de registros: ${report.metadata.totalRecords}`])
      excelData.push([])
    }

    // Add headers
    const headers = report.columns.map((col) => col.label)
    excelData.push(headers)

    // Add data rows
    for (const row of report.data) {
      const rowData = report.columns.map((col) => {
        const value = this.getNestedValue(row, col.key)
        return value !== null && value !== undefined ? value : "-"
      })
      excelData.push(rowData)
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Set column widths
    const columnWidths = report.columns.map(() => ({ wch: 20 }))
    worksheet["!cols"] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return buffer
  }

  static getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }
}

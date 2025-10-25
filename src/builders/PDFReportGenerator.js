import PDFDocument from "pdfkit"

export class PDFReportGenerator {
  static generate(report) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const chunks = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        // Header
        doc.fontSize(20).fillColor("#1E3A8A").text(report.title, { align: "center" })

        if (report.subtitle) {
          doc.fontSize(12).fillColor("#6B7280").text(report.subtitle, { align: "center" })
        }

        doc.moveDown()

        // Filters section
        if (Object.keys(report.filters).length > 0) {
          doc.fontSize(10).fillColor("#374151").text("Filtros aplicados:", { underline: true })

          for (const [key, value] of Object.entries(report.filters)) {
            if (value) {
              doc.fontSize(9).fillColor("#6B7280").text(`${key}: ${value}`)
            }
          }

          doc.moveDown()
        }

        // Metadata
        if (report.metadata.totalRecords) {
          doc.fontSize(10).fillColor("#374151").text(`Total de registros: ${report.metadata.totalRecords}`)
          doc.moveDown()
        }

        // Table header
        const tableTop = doc.y
        const columnWidth = 500 / report.columns.length
        let xPosition = 50

        doc.fontSize(10).fillColor("#1E3A8A")

        for (const column of report.columns) {
          doc.text(column.label, xPosition, tableTop, {
            width: columnWidth,
            align: "left",
          })
          xPosition += columnWidth
        }

        doc.moveDown()

        // Table rows
        doc.fontSize(9).fillColor("#374151")

        for (const row of report.data) {
          const rowY = doc.y
          xPosition = 50

          for (const column of report.columns) {
            const value = this.getNestedValue(row, column.key)
            doc.text(String(value || "-"), xPosition, rowY, {
              width: columnWidth,
              align: "left",
            })
            xPosition += columnWidth
          }

          doc.moveDown(0.5)

          // Add new page if needed
          if (doc.y > 700) {
            doc.addPage()
          }
        }

        // Footer
        const pages = doc.bufferedPageRange()
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i)
          doc
            .fontSize(8)
            .fillColor("#9CA3AF")
            .text(
              `Página ${i + 1} de ${pages.count} - Generado el ${new Date().toLocaleDateString()}`,
              50,
              doc.page.height - 50,
              { align: "center" },
            )
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  static getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }
}

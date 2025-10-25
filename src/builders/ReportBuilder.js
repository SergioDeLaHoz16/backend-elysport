// Builder Pattern for creating reports
export class ReportBuilder {
  constructor() {
    this.reset()
  }

  reset() {
    this.report = {
      title: "",
      subtitle: "",
      data: [],
      columns: [],
      filters: {},
      format: "pdf",
      metadata: {},
    }
  }

  setTitle(title) {
    this.report.title = title
    return this
  }

  setSubtitle(subtitle) {
    this.report.subtitle = subtitle
    return this
  }

  setData(data) {
    this.report.data = data
    return this
  }

  setColumns(columns) {
    this.report.columns = columns
    return this
  }

  setFilters(filters) {
    this.report.filters = filters
    return this
  }

  setFormat(format) {
    this.report.format = format
    return this
  }

  setMetadata(metadata) {
    this.report.metadata = metadata
    return this
  }

  build() {
    const report = this.report
    this.reset()
    return report
  }
}

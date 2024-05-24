/**
 * 将不同模板合并为一个模板
 * @param templateJsonList
 * @returns {} 锐浪报表json
 */
export function mergePrint(templateJsonList: any[]) {
  if (!templateJsonList || !templateJsonList.length) {
    return
  }

  const data: any = {
    Version: '6.7.5.6',
    Font: templateJsonList[0].Font || {
      Name: '宋体',
      Size: 105000,
      Weight: 400,
      Charset: 134
    },
    Printer: templateJsonList[0].Printer || {},
    ReportHeader: reportHeader(templateJsonList[0])
  }

  if (templateJsonList.length > 1) {
    data.ReportFooter = reportFooter(templateJsonList.slice(1))
  }

  return data
}

// 处理报表头，显示第一个模板
function reportHeader(templateJson: any) {
  templateJson = handleTemplate(templateJson)

  return [
    {
      Name: 'ReportHeader1',
      KeepTogether: false,
      CanGrow: true,
      CanShrink: true,
      Height: 6.79979,
      Control: [
        {
          Type: 'SubReport',
          Name: 'SubReport1',
          Dock: 'Fill',
          // ReportFile: url1
          Report: templateJson
        }
      ],
      NewPage: 'BeforeAfter'
    }
  ]
}

// 处理报表尾，显示其余模板
function reportFooter(templateJsonList: any[]) {
  const footer: any[] = []
  templateJsonList.forEach((template, index) => {
    template = handleTemplate(template)

    footer.push({
      Name: 'ReportFooter' + (index + 1),
      KeepTogether: false,
      CanGrow: true,
      CanShrink: true,
      Height: 9.2075,
      Control: [
        {
          Type: 'SubReport',
          Name: 'SubReport' + (index + 2),
          Dock: 'Fill',
          Report: template
        }
      ],
      NewPage: 'BeforeAfter'
    })
  })

  return footer
}

// 去除模板中设置的数据源
function handleTemplate(templateJson: any) {
  // 去除模板外层中设置的数据源 例: demo.json。合并打印中不需要此数据源
  if (templateJson?.ConnectionString) {
    delete templateJson?.ConnectionString
  }
  if (templateJson?.QuerySQL) {
    delete templateJson.QuerySQL
  }

  // 去除模板内层中设置的数据源 例: demo.json。合并打印中不需要此数据源
  if (templateJson?.DetailGrid?.Recordset?.ConnectionString) {
    delete templateJson.DetailGrid.Recordset.ConnectionString
  }
  if (templateJson?.DetailGrid?.Recordset?.QuerySQL) {
    delete templateJson.DetailGrid.Recordset.QuerySQL
  }
  return templateJson
}

shinyUI(
  fluidPage(
    includeCSS('../assets/bootstrap.css'),
    includeCSS('../assets/styles.css'),
    div(style = "width:800px;height:500px;",
        fluidRow(
          column(7, 
                 wellPanel(
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 100px;", selectInput('prop', 'Proportion', seq(0.1, 0.9, 0.1), selected = 0.5, selectize = FALSE)),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 100px;", selectInput('n', 'Sample size', 3:20, selected = 10, selectize = FALSE)),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 120px;padding-top:20px;", actionButton('take', 'Take a new sample')),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 50px;padding-top:20px;", actionButton('reset', 'Reset statistics'))
                 ),
                 plotOutput('popPlot', height = "380px")
                 
          ),
          column(5, 
                 plotOutput('curSamplePlot', height = "120px"),
                 plotOutput('distPlot', height = "380px")
          )
        )
    )
  )
)

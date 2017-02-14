shinyUI(
  fluidPage(
    includeCSS('../assets/bootstrap.css'),
    includeCSS('../assets/styles.css'),
    div(style = "width:800px;height:500px;",
        fluidRow(
          column(7, 
                 wellPanel(
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 100px;", selectInput('sigma', 'Sigma', 1:10, selected = 5, selectize = FALSE)),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 100px;", selectInput('n', 'Sample size', 3:20, selected = 10, selectize = FALSE)),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 120px;padding-top:20px;", actionButton('take', 'Take a new sample')),
                   div(style="display: inline-block;tetx-align:center;vertical-align:top; width: 50px;padding-top:20px;", actionButton('reset', 'Reset statistics'))
                 ),
                 plotOutput('popPlot', height = "380px")
                 
          ),
          column(5, 
                 plotOutput('distPlot', height = "380px")
          )
        )
    )
  )
)

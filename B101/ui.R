shinyUI(fluidPage(
  includeCSS('../assets/bootstrap.css'),
  includeCSS('../assets/styles.css'),
  fluidRow(
    div(style = "width:800px;height:410px;",
        column(
          3,
          wellPanel(
            sliderInput('sampleSize', 'Sample size', min = 5, max = 15, step = 1, value = 5),
            selectInput('sampleType', 'Type of sample', list('predefined', 'random'), selectize = FALSE),
            conditionalPanel(
              condition = "input.sampleType == 'random'",
              actionButton('newSample', 'Take a new sample')
            )
          ),
          wellPanel(
            selectInput('whichVariable', 'Which variable', choices = NULL, selectize = FALSE)
          )
        ),
        column(
          9,
          fluidRow(
            plotOutput('resPlot')
          )
        )
    )
  )
)
)

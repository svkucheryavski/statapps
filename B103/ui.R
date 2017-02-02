shinyUI(fluidPage(
  includeCSS('../assets/bootstrap.css'),
  includeCSS('../assets/styles.css'),
  fluidRow(
    div(style = "width:800px;height:500px;",
        fluidRow(
          column(
            3,
            wellPanel(
              selectInput('disttype', 'Type of distribution', 
                          list(
                            'Non-standardized' = 'nstd', 
                            'Standardized' = 'std'
                          ),
                          selectize = FALSE
              ),
              conditionalPanel(
                'input.disttype == "nstd"',
                sliderInput('mean', 'Mean', min = 60, max = 80, step = 1, value = 70),
                sliderInput('std', 'Standard deviation', min = 3, max = 10, step = 1, value = 5)
              ),
              selectInput('type', 'Work with', 
                          list(
                            'CDF, value' = 'cv', 
                            'CDF, interval' = 'ci', 
                            'ICDF, value' = 'iv',
                            'ICDF, interval' = 'ii'
                          ), 
                          selectize = FALSE)
            ),
            wellPanel(
              conditionalPanel(
                'input.type == "ci"',
                sliderInput('vleft', 'Weight, left', min = 41, max = 120, step = 1, value = 50),
                sliderInput('vright', 'Weight, right', min = 41, max = 120, step = 1, value = 70)
              ),
              conditionalPanel(
                'input.type == "cv"',
                sliderInput('vone', 'Weight', min = 41, max = 120, step = 1, value = 50)
              ),
              conditionalPanel(
                'input.type == "ii"',
                sliderInput('pleft', 'Probability, left', min = 0, max = 1, step = 0.01, value = 0.2),
                sliderInput('pright', 'Probability, right', min = 0, max = 1, step = 0.01, value = 0.8)
              ),
              conditionalPanel(
                'input.type == "iv"',
                sliderInput('pone', 'Probability', min = 0, max = 1, step = 0.01, value = 0.5)
              )
            )
          ),
          column(
            9,
            plotOutput('resPlot', height = "480px")
          )
        )
    )
  )
)
)

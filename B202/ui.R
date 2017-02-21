shinyUI(
  fluidPage(
    includeCSS('../assets/bootstrap.css'),
    includeCSS('../assets/styles.css'),
    div(style = "width:800px;height:500px;",
        fluidRow(
          wellPanel(
            div(
              style="padding: 0 15px;display: inline-block;tetx-align:center;vertical-align:top; width: 210px;", 
              sliderInput('alfa', 'Alfa', min = 0.01, max = 0.1, step = 0.01, value = 0.05)
            ),
            div(
              style="padding: 0 15px;display: inline-block;tetx-align:center;vertical-align:top; width: 210px;", 
              sliderInput('n', 'Sample size', min = 3, max = 20, step = 1, value = 10)
              ),
            div(
              style="padding: 0 15px;display: inline-block;tetx-align:center;vertical-align:top; width: 210px;", 
              sliderInput('mu2', 'True population mean', min = 165, max = 180, step = 1, value = 175)
            )
          ),
          plotOutput('popPlot', height = "380px")
        )
    )
  )
)

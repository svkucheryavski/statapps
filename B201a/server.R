# Define server logic required to draw a histogram
server <- function(input, output, session) {
  N = 400
  
  stats = reactiveValues(cursample = NULL, cumstat = NULL, pop = NULL)
  
  X = matrix(1:20, nrow = 20, ncol = 20)
  Y = matrix(1:20, nrow = 20, ncol = 20, byrow = TRUE)
  dim(X) = NULL
  dim(Y) = NULL

  observe({
    prop = as.numeric(input$prop)
    col = c(rep('red', N * prop), rep('blue', N * (1 - prop)))
    ind = sample(N)
    col = col[ind]
    stats$pop = col
  })  
  
  observeEvent(input$take, {
    n = as.numeric(input$n)
    sind = sample(N)[1:n]    
    stats$cursampleind = sind
    stats$cursample = stats$pop[sind]
    stats$cumstat = c(stats$cumstat, sum(stats$cursample == 'red')/n)
  })
  
  observeEvent(input$reset, {
    stats$cursample = NULL
    stats$cumstat = NULL 
  })
  
  output$popPlot = renderPlot({
    par(mar = c(1, 1, 3, 1))
    plot(X, Y, xlab = '', ylab = '', type = 'p', 
         pch = 20, col = stats$pop, cex = 3, bty = 'n',
         xaxt = 'n', yaxt = 'n', main = 'Population (N = 400)'
    )
    
    if (!is.null(stats$cursampleind))
      points(X[stats$cursampleind], Y[stats$cursampleind], col = 'white', pch = 16)
    
  })
  
  output$curSamplePlot = renderPlot({
    if (is.null(stats$cursample))
      return()
    n = length(stats$cursample)
    par(mar = c(1, 1, 3, 1))
    plot(1:n, rep(1, n), xlab = '', ylab = '', type = 'p', 
         xaxt = 'n', yaxt = 'n', ylim = c(0, 1.2), col = stats$cursample, 
         cex = 3, pch = 20, main = 'Last taken sample', bty = 'n')
    text(1, 0.4, sprintf('Proportion for last sample: %.1f', tail(stats$cumstat, n = 1)), col = '#404040', pos = 4)
  })
  
  output$distPlot = renderPlot({
    if (is.null(stats$cumstat))
      return()
    mu = as.numeric(input$prop)
    n = as.numeric(input$n)
    sigma = sqrt((mu * (1 - mu))/n)
    
    badv = sum(stats$cumstat < mu - 1.96 * sigma | stats$cumstat > mu + 1.96 * sigma)/length(stats$cumstat)
    
    x = seq(mu - 3 * sigma, mu + 3 * sigma, length.out = 100)
    f = dnorm(x, mu, sigma)
    
    par(mar = c(4, 1, 1, 1))
    hist(stats$cumstat, col = '#d0d0d0', freq = FALSE, xlim = c(0, 1), 
         border = 'white', ylim = c(-0.1, max(f) * 1.5),
         xlab = 'Sample proportions', main = '', ylab = '', yaxt = 'n')
    lines(x, f, col = 'blue', lwd = 2)
    segments(mu - 1.96 * sigma, 0, mu + 1.96 * sigma, 0, col = 'orange', lwd = 2)
    points(tail(stats$cumstat, n = 1), 0, col = 'red', pch = 16)
    text(0, max(f) * 1.5, sprintf('Number of samples taken: %d', length(stats$cumstat)), col = '#404040', pos = 4)
    text(0, max(f) * 1.4, sprintf('95%% confidence interval: %.2f...%.2f', mu - 1.96*sigma, mu + 1.96 * sigma), col = '#404040', pos = 4)
    text(0, max(f) * 1.3, sprintf('%% of cases outside interval: %.2f', badv), col = '#404040', pos = 4)
  })
  
}

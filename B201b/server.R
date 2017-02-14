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
    
    prop = as.numeric(input$prop)
    mu = as.numeric(tail(stats$cumstat, n = 1))
    n = as.numeric(input$n)
    sigma = sqrt((mu * (1 - mu))/n)
    left = mu - 1.96 * sigma
    right = mu + 1.96 * sigma
    
    muall = stats$cumstat
    sigmaall = sqrt((muall * (1 - muall))/n)
    badv = sum(input$prop <= muall - 1.96 * sigmaall | input$prop >= muall + 1.96 * sigmaall)/length(stats$cumstat)
    
    x = seq(mu - 3 * sigma, mu + 3 * sigma, length.out = 100)
    f = dnorm(x, mu, sigma)
    ind = x >= left & x <= right
    
    par(mar = c(4, 1, 1, 1))
    plot(x, f, type = 'l', col = 'blue', xlim = c(0, 1), lty = 2, ylim = c(-0.1, max(f) * 1.5),
         xlab = 'Possible population proportions', main = '', ylab = '', yaxt = 'n', bty = 'n')
    polygon(c(left, x[ind], right), c(0, f[ind], 0), col = '#f0f0ff', border = F)
    segments(prop, -0.1, prop, max(f), col = 'red')
   
    text(0, max(f) * 1.5, sprintf('Number of samples taken: %d', length(stats$cumstat)), col = '#404040', pos = 4)
    text(0, max(f) * 1.4, sprintf('95%% confidence interval: %.2f...%.2f', mu - 1.96*sigma, mu + 1.96 * sigma), col = '#404040', pos = 4)
    text(0, max(f) * 1.3, sprintf('%% of cases proportion outside interval: %.2f', badv), col = '#404040', pos = 4)
  })
  
}

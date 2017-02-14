# Define server logic required to draw a histogram
server <- function(input, output, session) {
  mu = 70
  stats = reactiveValues(sample = NULL, cumstat = NULL, left = NULL, right = NULL, inside = NULL, m = NULL, s = NULL)
  
  observe({
    sigma = input$sigma
    n = input$n
    stats$sample = NULL
    stats$cumstats = NULL
    stats$left = NULL
    stats$right = NULL
    stats$inside = NULL 
    stats$m = NULL
    stats$s = NULL
  })
  
  observeEvent(input$take, {
    n = as.numeric(input$n)
    sigma = as.numeric(input$sigma)
    stats$sample = rnorm(n, mu, sigma)
    stats$m = mean(stats$sample)
    stats$cumstats = c(stats$cumstats, stats$m)
    stats$s = sd(stats$sample)
    stats$left = mu + qnorm(0.025) * sigma / sqrt(n)
    stats$right = mu + qnorm(0.975) * sigma / sqrt(n)
    stats$inside = c(stats$inside, (stats$m >= stats$left & stats$m <= stats$right))
  })
  
  observeEvent(input$reset, {
    stats$sample = NULL
    stats$cumstats = NULL
    stats$left = NULL
    stats$right = NULL
    stats$inside = NULL 
    stats$m = NULL
    stats$s = NULL
  })
  
  output$popPlot = renderPlot({
    if (is.null(input$sigma))
      return()
    
    sigma = as.numeric(input$sigma)
    x = seq(mu - 3.5 * sigma, mu + 3.5 * sigma, length.out = 500);
    f = dnorm(x, mu, sigma)

    par(mar = c(4, 4, 4, 0))
    plot(x, f, xlab = 'Weight, kg', ylab = 'Density', type = 'l', xlim = c(30, 110),
         col = 'blue', lwd = 2, main = paste('Population (', expression(mu),' = ', mu, ', ', expression(sigma), '=', input$sigma, ')')
    )
    abline(v = mu, col = 'blue', lty = 2)      
    grid()
    
    if (!is.null(stats$sample)){
      points(stats$sample, rep(0, length(stats$sample)), col = 'red', pch = 16)
      abline(v = stats$m, col = 'red', lty = 2)      
    }
    
  })
  
  output$distPlot = renderPlot({
    if (is.null(stats$cumstats))
      return()

    sigma = as.numeric(input$sigma)
    n = as.numeric(input$n)
    se = sigma / sqrt(n)

    x = seq(mu - 3.5 * se, mu + 3.5 * se, length.out = 500)
    f = dnorm(x, mu, se) 
    
    par(mar = c(3, 1, 1, 1))
    hist(stats$cumstats, col = '#d0d0d0', freq = FALSE, xlim = c(55, 85), 
         border = 'white', ylim = c(-0.01, max(f) * 1.6),
         xlab = 'Sample means', main = '', ylab = '', yaxt = 'n')
    lines(x, f, col = 'blue', lwd = 2)
    segments(stats$left, 0, stats$right, 0, col = 'orange', lwd = 2)
    points(stats$m, 0, col = 'red', pch = 16)
    text(56, max(f) * 1.6, sprintf('Current sample: m = %.1f, s = %.1f', stats$m, stats$s), col = '#404040', pos = 4)
    text(56, max(f) * 1.5, sprintf('Number of samples taken: %d', length(stats$cumstats)), col = '#404040', pos = 4)
    text(56, max(f) * 1.4, sprintf('95%% confidence interval: %.2f...%.2f', stats$left, stats$right), col = '#404040', pos = 4)
    text(56, max(f) * 1.3, sprintf('%% of cases outside interval: %.2f', 100 - sum(stats$inside)/length(stats$inside) * 100), col = '#404040', pos = 4)
  })
  
}

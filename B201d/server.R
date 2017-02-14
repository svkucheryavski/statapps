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
    stats$left = stats$m + qt(0.025, n - 1) * stats$s / sqrt(n)
    stats$right = stats$m + qt(0.975, n - 1) * stats$s / sqrt(n)
    stats$inside = c(stats$inside, (mu >= stats$left & mu <= stats$right))
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
         col = 'blue', lwd = 2, main = paste('Population (mu = ', mu, ', sigma =', input$sigma, ')')
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

    n = as.numeric(input$n)
    m = stats$m    
    se = stats$s / sqrt(n)

    x = seq(m + qt(0.005, n - 1) * se, m + qt(0.995, n - 1) * se, length.out = 500)
    ind = x >= stats$left & x <= stats$right
    f = dt((x - m)/se, n - 1) 
    
    par(mar = c(4, 1, 1, 1))
    plot(x, f, type = 'l', col = 'red', xlim = c(55, 85), lty = 2, ylim = c(-0.01, max(f) * 1.6),
         xlab = 'Possible population means', main = '', ylab = '', yaxt = 'n', bty = 'n')
    polygon(c(stats$left, x[ind], stats$right), c(0, f[ind], 0), col = '#fff0f0', border = F)
    segments(mu, -0.1, mu, max(f), col = 'blue')
    
    
    
    text(56, max(f) * 1.6, sprintf('Current sample: m = %.1f, s = %.1f', stats$m, stats$s), col = '#404040', pos = 4)
    text(56, max(f) * 1.5, sprintf('Number of samples taken: %d', length(stats$cumstats)), col = '#404040', pos = 4)
    text(56, max(f) * 1.4, sprintf('95%% confidence interval: %.2f...%.2f', stats$left, stats$right), col = '#404040', pos = 4)
    text(56, max(f) * 1.3, sprintf('%% of cases outside interval: %.2f', 100 - sum(stats$inside)/length(stats$inside) * 100), col = '#404040', pos = 4)
  })
  
}

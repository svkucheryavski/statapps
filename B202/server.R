# Define server logic required to draw a histogram
server <- function(input, output, session) {
  sigma = 10
  mu1 = 165
  output$popPlot = renderPlot({
    mu2 = input$mu2
    n = input$n
    se = sigma / sqrt(n)
    
    alfa = input$alfa
    alfa_x = qt(1 - alfa, n - 1) * se + mu1     
      
    r = power.t.test(sd = sigma, delta = mu2 - mu1, n = n, sig.level = alfa, alternative = 'one.sided', type = 'one.sample')
    beta = 1 - r$power
  
    x1 = seq(mu1 - 4.5 * se, mu1 + 4.5 * se, length.out = 500);
    x2 = seq(mu2 - 4.5 * se, mu2 + 4.5 * se, length.out = 500);
    f1 = dt((x1 - mu1)/se, n - 1)
    f2 = dt((x2 - mu2)/se, n - 1)
 
    par(mar = c(4, 5, 1, 0)) 
    plot(x1, f1, type = 'l', col = 'red', xlim = c(145, 195), xlab = 'Possible average height for a sample, cm',
         ylab = 'Density')
    lines(x2, f2, type = 'l', col = 'blue')
    lines(c(alfa_x, alfa_x), c(0, f1[which(abs(x1 - alfa_x) < 0.02)[1]]), col = 'red', lty = 2)
    
    ind1 = which(x1 >= alfa_x)
    ind2 = which(x2 <= alfa_x)
    if (length(ind1) > 1)
      polygon(c(x1[ind1[1]], x1[ind1], x1[500]), c(0, f1[ind1], 0), border = NA, col = '#ff000040')
    if (length(ind2) > 1)
      polygon(c(x2[1], x2[ind2], x2[ind2[length(ind2)]]), c(0, f2[ind2], 0), border = NA, col = '#0000ff40')
    grid()
    text(150, 0.3, sprintf('Alfa = %.2f', alfa), pos = 4)
    text(150, 0.27, sprintf('Beta = %.3f', beta), pos = 4)
    text(150, 0.24, sprintf('Power = %.3f', 1 - beta), pos = 4)
  })
  
}

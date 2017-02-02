# Define server logic required to draw a histogram
server <- function(input, output, session) {
  n = 500 
  
  showline = function(x, y, text, pos = NULL, dir = 'h', start.x = 0, start.y = 0) {
    if (dir == 'h') {
      if (is.null(pos)) pos = 3
      lines(c(start.x, x), c(y, y), col = 'red')
      points(c(start.x, x), c(y, y), col = 'red', pch = 16)
      text((start.x + x)/2, y, text, pos = pos, cex = 0.9, col = '#aa3030')
    } else {
      if (is.null(pos)) pos = 4
      lines(c(x, x), c(start.y, y), col = 'red')
      points(c(x, x), c(start.y, y), col = 'red', pch = 16)
      text(x, (start.y + y)/2, text, pos = pos, cex = 0.9, col = '#707070')
    }
  }
  
  output$resPlot = renderPlot({
    
    if (input$disttype == 'std') {
      m = 0
      s = 0
      xlim = c(-3.5, 3.5)
    } else {
      m = input$mean
      s = input$std
      xlim = c(30, 110)
    }
    
    a = m - 3.5 * s
    b = m + 3.5 * s
    
    x = seq(a, b, len = n)
    p = seq(0.00001, 0.999999, len = n)
    pdf = dnorm(x, m, s)
    cdf = pnorm(x, m, s)
    icdf = qnorm(p, m, s)
    
    x.l = NULL
    x.r = NULL
    p.l = NULL
    p.r = NULL
    y.l = NULL
    y.r = NULL
    x.p = NULL
    y.p = NULL
    if (input$type == 'cv') {
      x.p = input$vone
      p.p = pnorm(x.p, m, s)
      y.p = dnorm(x.p, m, s)
    } else if (input$type == 'ci') {
      x.l = input$vleft
      x.r = input$vright
      if (x.l > x.r){
        temp = x.l
        x.l = x.r
        x.r = temp
      }
      p.l = pnorm(x.l, m, s)
      p.r = pnorm(x.r, m, s)
      y.l = dnorm(x.l, m, s)
      y.r = dnorm(x.r, m, s)
    } else if (input$type == 'iv') {
      p.p = input$pone
      x.p = qnorm(p.p, m, s)
      y.p = dnorm(x.p, m, s)
    } else if (input$type == 'ii') {
      p.l = input$pleft
      p.r = input$pright
      if (p.l > p.r){
        temp = p.l
        p.l = p.r
        p.r = temp
      }
      x.l = qnorm(p.l, m, s)
      x.r = qnorm(p.r, m, s)
      y.l = dnorm(x.l, m, s)
      y.r = dnorm(x.r, m, s)
    }
   
    # PDFi
    par(mar = c(25, 5, 2, 2), cex = 0.8, mgp = c(2, 1, 0))
    plot(x, pdf, col = 'blue', type = 'l', ylab = 'f(x)', xlab = 'Weight, kg', xlim = xlim)
    polygon(c(x[1], x, x[n]), c(0, pdf, 0), col = '#f8f8f8', border = NA) 
    title('PDF', line = 1)
    
    if (!is.null(x.p) && !is.null(p.p)) {
      ind = which(x < x.p)
      if (length(ind) > 0) {
        last = ind[length(ind)]
        polygon(c(x[1], x[ind], x[last]), c(0, pdf[ind], 0), col = '#fff0f0', border = NA) 
        showline(x.p, y.p, round(x.p, 1), dir = 'v')
        text((a + x.p)/2, y.p/2, paste(round(p.p*100, 1), '%'), cex = 0.9, col = '#aa3030')
      }
    } else {
      ind = which(x >= x.l & x <= x.r)
      polygon(c(x.l, x[ind], x.r), c(0, pdf[ind], 0), col = '#fff0f0', border = NA) 
      showline(x.l, y.l, round(x.l, 1), dir = 'v', pos = 2)
      showline(x.r, y.r, round(x.r, 1), dir = 'v')
      text((x.r + x.l)/2, y.l/2, paste(round((p.r - p.l)*100, 1), '%'), cex = 0.9, col = '#aa3030')
    }
    
    # CDF
    par(new = TRUE, cex = 0.8, mar = c(5, 5, 22, 28), mgp = c(2, 1, 0))
    plot(x, cdf, type = 'l', col = 'blue', xlab = 'Weight, kg', 
         ylim = c(0, 1.1), xlim = xlim,
         ylab = 'F(x)')
    grid()
    title('CDF', line = 1)
    if (!is.null(x.p) && !is.null(p.p)) {
      showline(x.p, p.p, round(x.p, 1), dir = 'v')
      showline(x.p, p.p, round(p.p, 3), dir = 'h')
    } else {
      showline(x.l, p.l, round(x.l, 1), dir = 'v')
      showline(x.l, p.l, round(p.l, 3), dir = 'h')
      showline(x.r, p.r, round(x.r, 1), dir = 'v')
      showline(x.r, p.r, round(p.r, 3), dir = 'h')
    } 
    # ICDF
    par(new = TRUE, cex = 0.8, mar = c(5, 29, 22, 2), mgp = c(2, 1, 0))
    plot(p, icdf, type = 'l', col = 'blue', xlab = 'Probability, p', 
         xlim = c(0, 1.05), ylim = xlim,
         ylab = expression(paste(F^-1, '(p)')))
    grid()
    title('ICDF', line = 1)
    if (!is.null(x.p) && !is.null(p.p)) {
      showline(p.p, x.p, round(p.p, 3), dir = 'v', start.x = 0, start.y = xlim[1])
      showline(p.p, x.p, round(x.p, 1), dir = 'h', start.x = 0, start.y = xlim[1])
    } else {
      showline(p.l, x.l, round(p.l, 3), dir = 'v', start.x = 0, start.y = xlim[1])
      showline(p.l, x.l, round(x.l, 1), dir = 'h', start.x = 0, start.y = xlim[1])
      showline(p.r, x.r, round(p.r, 3), dir = 'v', start.x = 0, start.y = xlim[1])
      showline(p.r, x.r, round(x.r, 1), dir = 'h', start.x = 0, start.y = xlim[1])
    } 
  })
  
}

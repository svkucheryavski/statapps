# Define server logic required to draw a histogram
server <- function(input, output, session) {
  n = 500 
  a = 40
  b = 120
  
  showline = function(x, y, text, pos = NULL, dir = 'h', start.x = a, start.y = 0) {
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
    x = seq(a, b, len = n)
    p = seq(0.00001, 0.999999, len = n)
    pdf = dunif(x, a, b)
    cdf = punif(x, a, b)
    icdf = qunif(p, a, b)
    
    x.l = NULL
    x.r = NULL
    p.l = NULL
    p.r = NULL
    x.p = NULL
    y.p = NULL
    if (input$type == 'cv') {
      x.p = input$vone
      p.p = punif(x.p, a, b)
      y.p = dunif(x.p, a, b)
    } else if (input$type == 'ci') {
      x.l = input$vleft
      x.r = input$vright
      if (x.l > x.r){
        temp = x.l
        x.l = x.r
        x.r = temp
      }
      p.l = punif(x.l, a, b)
      p.r = punif(x.r, a, b)
      y.p = dunif(x.l, a, b)
    } else if (input$type == 'iv') {
      p.p = input$pone
      x.p = qunif(p.p, a, b)
      y.p = dunif(x.p, a, b)
    } else if (input$type == 'ii') {
      p.l = input$pleft
      p.r = input$pright
      
      if (p.l > p.r){
        temp = p.l
        p.l = p.r
        p.r = temp
      }
        
      x.l = qunif(p.l, a, b)
      x.r = qunif(p.r, a, b)
      y.p = dunif(x.l, a, b)
    }
    
    # PDFi
    par(mar = c(25, 5, 2, 2), cex = 0.8, mgp = c(2, 1, 0))
    plot(x, pdf, col = 'blue', type = 'l', ylab = 'f(x)', xlab = 'Weight, kg', ylim = c(0, 0.015))
    polygon(c(x[1], x, x[n]), c(0, pdf, 0), col = '#f8f8f8', border = NA) 
    title('PDF', line = 1)
    
    if (!is.null(x.p) && !is.null(p.p)) {
      ind = which(x < x.p)
      last = ind[length(ind)]
      polygon(c(x[1], x[ind], x[last]), c(0, pdf[ind], 0), col = '#fff0f0', border = NA) 
      showline(x.p, y.p, x.p, dir = 'v')
      text((a + x.p)/2, y.p/2, paste(round(p.p*100, 1), '%'), cex = 0.9, col = '#aa3030')
    } else {
      ind = which(x >= x.l & x <= x.r)
      polygon(c(x.l, x[ind], x.r), c(0, pdf[ind], 0), col = '#fff0f0', border = NA) 
      showline(x.l, y.p, x.l, dir = 'v', pos = 2)
      showline(x.r, y.p, x.r, dir = 'v')
      text((x.r + x.l)/2, y.p/2, paste(round((p.r - p.l)*100, 1), '%'), cex = 0.9, col = '#aa3030')
    }
    
    # CDF
    par(new = TRUE, cex = 0.8, mar = c(5, 5, 22, 28), mgp = c(2, 1, 0))
    plot(x, cdf, type = 'l', col = 'blue', xlab = 'Weight, kg', 
         ylim = c(0, 1.1), xlim = c(40, 130),
         ylab = 'F(x)')
    grid()
    title('CDF', line = 1)
    if (!is.null(x.p) && !is.null(p.p)) {
      showline(x.p, p.p, x.p, dir = 'v')
      showline(x.p, p.p, round(p.p, 3), dir = 'h')
    } else {
      showline(x.l, p.l, x.l, dir = 'v')
      showline(x.l, p.l, round(p.l, 3), dir = 'h')
      showline(x.r, p.r, x.r, dir = 'v')
      showline(x.r, p.r, round(p.r, 3), dir = 'h')
    } 
     
    # ICDF
    par(new = TRUE, cex = 0.8, mar = c(5, 29, 22, 2), mgp = c(2, 1, 0))
    plot(p, icdf, type = 'l', col = 'blue', xlab = 'Probability, p', 
         xlim = c(0, 1.05), ylim = c(40, 130),
         ylab = expression(paste(F^-1, '(p)')))
    grid()
    title('ICDF', line = 1)
    if (!is.null(x.p) && !is.null(p.p)) {
      showline(p.p, x.p, round(p.p, 3), dir = 'v', start.x = 0, start.y = a)
      showline(p.p, x.p, x.p, dir = 'h', start.x = 0, start.y = a)
    } else {
      showline(p.l, x.l, round(p.l, 3), dir = 'v', start.x = 0, start.y = a)
      showline(p.l, x.l, x.l, dir = 'h', start.x = 0, start.y = a)
      showline(p.r, x.r, round(p.r, 3), dir = 'v', start.x = 0, start.y = a)
      showline(p.r, x.r, x.r, dir = 'h', start.x = 0, start.y = a)
    } 
  })
  
}

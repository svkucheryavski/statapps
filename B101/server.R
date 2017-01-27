# Define server logic required to draw a histogram
server <- function(input, output, session) {
  load('statapps.RData')
  
  get.sample = function(n = 10, random = TRUE) {
    if (random == FALSE)
      set.seed(142)
    sample = people[sample(nrow(people))[1:n], , drop = FALSE]
    sample
  }
  
  varnames = colnames(people)[1:5]
  updateSelectInput(session, "whichVariable", choices = varnames, selected = varnames[1])  
  
  # get a sample when necessary
  data = reactive({
    input$newSample
    varName = input$whichVariable
    
    if (is.null(varName) || nchar(varName) == 0)
      return()
    
    n = input$sampleSize
    x = sort(get.sample(n = n, random = input$sampleType == 'random')[, varName])
    i = 1:n
    
    data = list(x = round(x), pop = people[, varName], varName = varName, n = n, p = round((i - 0.5)/n, 2), i = i)
  }) 
  
  
  output$resPlot = renderPlot({
    
    d = data()
    if (is.null(d))
      return()
    
    xlim = c(min(d$pop), max(d$pop)) 
    Q = quantile(d$x, c(0.25, 0.5, 0.75), type = 5)
    
    par(mar = c(8, 5, 2, 14))
    h = hist(d$pop, 75, col = '#f0f0f0', xlim = xlim, xlab = '', border = NA, xaxt = 'n', 
             main = 'Population and sample')
    points(d$x, rep(0.25 * max(h$counts), length(d$x)), pch = 16, col = 'blue')
    
    par(new = TRUE, mar = c(6, 5, 19, 14)) 
    boxplot(d$pop, horizontal = T, ylim = xlim, xlab = d$varName, border = 'gray', frame = F)
    par(new = TRUE, mar = c(14, 5, 8, 14)) 
    boxplot(d$x, horizontal = T, ylim = xlim, border = 'blue', yaxt = 'n', xaxt = 'n', frame = F)
    
    par(new = TRUE, mar = c(16, 30, 2, 2), cex = 0.75, mgp = c(2, 1, 0))
    plot(h$mids, cumsum(h$counts/sum(h$counts)), type = 'l', col = '#e0e0e0', 
         xlab = d$varName, ylab = 'Percentiles', main = '')
    lines(d$x, d$p, type = 'b', col = 'blue') 
    abline(h = c(0.25, 0.5, 0.75), lty = 2, col = '#e0e0e0')
  })
  
}

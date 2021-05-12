<script>
   import {Axes, BarSeries} from 'svelte-plots';
   import {default as StatApp} from '../../shared/StatApp.svelte';

   let randomSample = false;
   let sampleSize = 5;
   let variableName = "Height";

   const populationSize = 10000;
   const nBins = 100;


</script>

<StatApp>
   <div class="app-layout">
      <!-- plot with histogram -->
      <div class="app-histogram-area">
         <Axes>
         <BarSeries
            xValues="{[1, 2, 3]}"
            yValues="{[10, 20, 15]}"
         />
         </Axes>
      </div>

      <!-- plot with population and sample percentiles -->
      <div class="app-percentile-area">

      </div>

      <!-- control elements -->
      <div class="app-controls">
         <input type="progre">
      </div>

   </div>
</StatApp>

<style>
.app-layout {
   background: red;
   display: grid;
   grid-template-columns: 3fr 2fr;
   grid-template-rows: 1fr 100px;
   height: 100%;
}
</style>
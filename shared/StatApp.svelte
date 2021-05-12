<script>
   let showHelp = false;
   const toggleHelp = () => showHelp = !showHelp;
</script>

<main class="statapp">

   {#if !showHelp}
   <div class="statapp__content">
   <slot></slot>
   </div>

   {:else}
   <div class="statapp__helptext">
      Help text is here
      <slot name="help"></slot>
   </div>
   <div>
   <button on:click|preventDefault="{toggleHelp}">Back to app</button>
   </div>
   {/if}

</main>

<style>

.statapp {
   background: #eee;
   min-width: 300px;
   min-height: 300px;
   max-width: 1000px;
   max-height: 1000px;
   width: 100%;
   height: 100%;
   padding: 0;
   margin: 0 auto;
}

.statapp__content {
   width: 100%;
   height: 100%;
}

.statapp__helptext {
   width: 100%;
   height: 100%;
}


</style>
<template>
  <div id ="app">
    <Map />
    <RightPanel/>
  </div>
</template>

<script>
export default{
  
}

import { vueSlideoutPanelService } from 'vue2-slideout-panel';

const panel1Handle = vueSlideoutPanelService.show({
  //component : 'slideout-panel',
  props: {
    //any data you want passed to your component
  }
})
</script>

<template>
  <slideout-panel/>
</template>

<script>

import { vueSlideoutPanelService } from 'vue2-slideout-panel';

const panel1Handle = vueSlideoutPanelService.show({
  //component : 'slideout-panel',
  props: {
    //any data you want passed to your component
  }
})
</script>

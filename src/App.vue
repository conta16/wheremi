<template>
  <div id ="app">
    <button class="btn btn-primary" v-on:click.prevent="showPanel">
      Accedi
    </button>
    <slideout-panel></slideout-panel>
  </div>
</template>

<script>
import { vueSlideoutPanelService } from 'vue2-slideout-panel';
import RightPanel from './components/RightPanel';
window.vue2PanelDebug = true
export default{
  name: 'app',
  components: {
    RightPanel
  },
  data(){
    return{
    }
  },
  methods:{
    showPanel() {
      const panel = this.$showPanel({
        component: RightPanel,
        cssClass: "panel-1",
        width: 500,
        props: {}
      });
    }
  }
}

/*const panel1Handle = vueSlideoutPanelService.show({
  component : 'slideout-panel',
  props: {
    
  }
})*/
</script>

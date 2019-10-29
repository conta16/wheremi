import Vue from 'vue';
import VueSlideoutPanel from 'vue2-slideout-panel';

Vue.use(VueSlideoutPanel);

window.vue2PanelDebug = true;

Vue.component("panel-1", {
  name: "panel-1",
  template: `
<div>
<button class="btn btn-primary" v-on:click.prevent="closePanel">
Close Panel
</button>
</div>
`,
  data() {
    return {};
  },
  methods: {
    closePanel() {
      this.$emit("closePanel", {});
    }
  }
});

new Vue({ // eslint-disable-line no-new
  el: "#app",
  data() {
    return {};
  },
  methods: {
    showPanel() {
      this.$showPanel({
        component: "panel-1",
        openOn: "right",
        cssClass: "panel-1",
        width: 500,
        props: {}
      });
    }
  }
});
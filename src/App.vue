<template>
  //<slideout-panel></slideout-panel>
</template>

<script>
    /*export default {
        data() {
            return {
                menu: [
                    {
                        header: true,
                        title: 'Main Navigation',
                        hiddenOnCollapse: true
                    },
                    {
                        href: '/',
                        title: 'Dashboard',
                        icon: 'fa fa-user'
                    },
                    {
                        href: '/charts',
                        title: 'Charts',
                        icon: 'fa fa-chart-area',
                        child: [
                            {
                                href: '/charts/sublink',
                                title: 'Sub Link'
                            }
                        ]
                    }
                ]
            }
        }
    }*/

import { vueSlideoutPanelService } from 'vue2-slideout-panel';

const panel1Handle = vueSlideoutPanelService.show({
  //component : 'slideout-panel',
  props: {
    //any data you want passed to your component
  }
})
</script>

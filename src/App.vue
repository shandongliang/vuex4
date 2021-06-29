<template>
  计数器: {{count}} {{$store.state.count}}
  <hr>
  double: {{double}} {{$store.getters.double}}
  <hr>
  <!--严格模式下会报错-->
  <button @click="$store.state.count++">错误修改</button>

  <!--同步模式-->
  <button @click="add">同步修改</button>

  <!--异步模式-->
  <button @click="addSync">异步修改</button>
   <hr>
  aCount: {{aCount}} bCount:{{bCount}}
  <button @click="$store.commit('aCount/add',1)">修改a</button>
  <button @click="$store.commit('bCount/add',1)">修改b</button>
  <hr>
  
</template>

<script>

import { useStore } from '@/vuex'
import { computed } from 'vue'

export default {
  name: 'App',

  setup(){
    const store = useStore()
    function add (){
      store.commit("add", 1)
    }
    function addSync () {
      store.dispatch('addSync', 1)
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      add,
      addSync
    }

  }
}
</script>


import { createStore } from '@/vuex' //new Store

export default createStore({
  state: {
    count: 0
  },
  getters: { //计算属性 vuex4 没有实现计算属性的功能
    double (state) {
      return state.count * 2
    }
  },
  mutations: { //可以更改状态，必须是同步的
    add(state, payload) {
      return state.count += payload
    }
  },
  actions: { // 可以调用其他action，或者调用mutation
    addSync({commit}, payload){
      setTimeout(() => {
        commit('add', payload)
      },1000)
    }
  }

  // dispatch(action) -> commit(mutation)
})



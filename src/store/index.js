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
  },

  // dispatch(action) -> commit(mutation)

  
  modules: { // 子模块 实现逻辑的拆分 
    aCount: {
        namespaced: true,
        state: { count: 0 },
        getters: { //计算属性 vuex4 没有实现计算属性的功能
          double1 (state) {
            return state.count * 2
          }
        },
        mutations: {
            add(state, payload) { // aCount/add
                state.count += payload
            }
        },
        modules: {
            cCount: {
                namespaced:true,
                state: { count: 0 },
                mutations: {
                    add(state, payload) { // aCount/cCount
                        state.count += payload
                    }
                },
                modules: {
                  dCount: {
                      namespaced:true,
                      state: { count: 0 },
                      mutations: {
                          add(state, payload) { // aCount/cCount
                              state.count += payload
                          }
                      },
                  }
              }
            }
        }
    },
    bCount: {
        state: { count: 0 },
        namespaced: true,
        mutations: {
            add(state, payload) {
                state.count += payload
            }
        },
    }

}
  
})



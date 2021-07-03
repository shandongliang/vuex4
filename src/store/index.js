import { createStore } from '@/vuex' //new Store

function customPlugin (store) {
  let local = localStorage.getItem("VUEX:STATE")
  if(local){
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutation, state) => {
    console.log(mutation, state)
    localStorage.setItem("VUEX:STATE", JSON.stringify(state))
  })
}

const store = createStore({
  plugins: [ //会按照注册的顺序依次执行，执行的时候会把store传递进来
    // customPlugin //每个插件都是一个函数
  ],
  strict: true, //开启严格模式，不允许永华非法操作（只能在mumation中修改状态，否则就会发生异常）
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
        // modules: {
        //     cCount: {
        //         namespaced:true,
        //         state: { count: 0 },
        //         mutations: {
        //             add(state, payload) { // aCount/cCount
        //                 state.count += payload
        //             }
        //         },
        //         modules: {
        //           dCount: {
        //               namespaced:true,
        //               state: { count: 0 },
        //               mutations: {
        //                   add(state, payload) { // aCount/cCount
        //                       state.count += payload
        //                   }
        //               },
        //           }
        //       }
        //     }
        // }
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

store.registerModule(['aCount', 'cCount'], {
  namespaced: true,
  state: {
      count: 100,
  },
  mutations: {
      add(state, payload) {
          state.count += payload
      }
  },
})


export default store


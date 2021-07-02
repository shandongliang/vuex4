import { reactive } from "vue"
import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'
import { forEachValue, isPromise } from "./utils"

function getLatestState(state, path){
	return path.reduce((state, key) => state[key], state)
}

function installModule (store, rootState, path, module){ //递归安装
	let isRoot = !path.length  // 空数组说明是根

	const namespaced = store._module.getNamespaced(path)

	if(!isRoot){
		let parentState = path.slice(0, -1).reduce((state, key) => {
			return state[key]
		}, rootState)
		parentState[path[path.length - 1]] = module.state
	}

	

	module.forEachGetters((getter, key) => { // {double:function(state){}}
		store._wrappedGetters[namespaced + key] = () => {
			return getter(getLatestState(store.state, path))// 如果直接使用模块上自己的状态，此状态不是响应式的
		}
	})

	module.forEachMutations((mutation, key) => {
		const entry = store._mutations[namespaced + key] || (store._mutations[namespaced + key] = [])
		entry.push((payload) => { // store.commit("add", payload)
			mutation.call(store, getLatestState(store.state, path), payload)
		})
	})

	module.forEachActions((action, key) => {
		const entry = store._actions[namespaced + key] || (store._actions[namespaced + key] = [])
		entry.push((payload) => { // store.dispatch("add", payload)
			let res = action.call(store, store, payload)
			// 给异步增加promise的能力
			if(isPromise(res)){
				return new Promise.resolve(res)
			} else {
				return res
			}
		})
	})

	
	module.forEachChild((child, key) => { //aCount bCount
		installModule(store, rootState, path.concat(key), child)
	})
}

function resetStoreState (store, state) {
	store._state = reactive({data: state})
	const wrappedGetters = store._wrappedGetters
	store.getters = {}
	forEachValue(wrappedGetters, (getter, key) => {
		console.log(key, getter)
		Object.defineProperty(store.getters, key, {
			get: getter,
			enumerable: true
		})
	})
}

export default class Store {
	constructor(options) {
		const store = this
		store._module = new ModuleCollection(options) // 格式化数据，树状结构

		store._wrappedGetters = Object.create(null)
		store._mutations = Object.create(null)
		store._actions = Object.create(null)

		//定义状态
		const state = store._module.root.state; // 根状态
		installModule(store, state, [], store._module.root) //安装state

		resetStoreState(store, state)//把状态定义到store上
		console.log(store)
	}

	get state () {
		return this._state.data
	}

	commit = (type, payload) => {
		const entry = this._mutations[type] || []
		entry.forEach(handler => handler(payload))
	}

	dispatch = (type, payload) => {
		const entry = this._actions[type] || []
		return Promise.all(entry.map(handler => handler(payload)))
	}

	install(app, injectKey){
		// vue3没有实例的概念， app是对象
		// 全局暴露一个变量， 暴露的是store的实例
		app.provide(injectKey || storeKey, this)
		
		// Vue.prototype.$store = this vue2的写法
		app.config.globalProperties.$store = this //增添￥store属性
	}
}




/**
 * 1.格式化数据
 * 2.安装，保存在需要的变量上
 * 3.给容器添加需要的状态
 */

import { reactive, watch } from "vue"
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
		store._withCommit(() => parentState[path[path.length - 1]] = module.state)
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
		Object.defineProperty(store.getters, key, {
			get: getter,
			enumerable: true
		})
	})
	if(store._strict){
		enableStriceMode(store)
	}
}

// 监控数据变化
function enableStriceMode(store){
	watch(() => store._state.data, () => { //监控数据变化，数据变化后执行回调函数
		console.assert(store._commiting,'Do not mutate vuex store state outside mutation handlers!')
	},{deep:true, flush: 'sync'}) //watch默认是异步，通过flush更改成同步
}

export default class Store {
	constructor(options) {
		const store = this
		store._module = new ModuleCollection(options) // 格式化数据，树状结构

		store._wrappedGetters = Object.create(null)
		store._mutations = Object.create(null)
		store._actions = Object.create(null)

		store._strict = options.strict || false // 是不是严格模式

		// 调用的时候 知道是mutation，mutation里面要写同步代码

		this._commiting = false

		/**
		 * 在mutation之前添加一个状态_commiting = true
		 * 调用mutation ->会更改状态，监控这个状态，如果当前状态变化的时候_commiting = true,则是同步更改
		 * _commiting = false
		 */

		//定义状态
		const state = store._module.root.state; // 根状态
		installModule(store, state, [], store._module.root) //安装state

		resetStoreState(store, state)//把状态定义到store上

		store._subscribes = [];

		//注册完状态再执行插件，这样才会有状态
		options.plugins.forEach(option => option(store)) //插件实质上是函数
		// console.log(store)
	}

	get state () {
		return this._state.data
	}

	//实现订阅
	subscribe(fn){
		this._subscribes.push(fn)
	}

	replaceState(newState){
		this._withCommit(() => {
			this._state.data = newState
		})
	}

	_withCommit (fn) { //切片
		const commting = this._commiting
		this._commiting = true
		fn()
		this._commiting = commting
	}

	commit = (type, payload) => {
		const entry = this._mutations[type] || []
		this._withCommit(() => {
			entry.forEach(handler => handler(payload))
			this._subscribes.forEach(sub => sub({type, payload}, this.state))
		})
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
		app.config.globalProperties.$store = this //增添Sstore属性
	}

	registerModule(path, rawModule){
		const store = this
		if(typeof path === 'string') path = [path]

		// 要在原有的模块基础上新增一个
		const newModule = store._module.register(rawModule, path) //注册上去

		// 把模块安装上
		installModule(store, store.state, path, newModule)

		// 重置容器
		resetStoreState(store, store.state)
	}
}




/**
 * 1.格式化数据
 * 2.安装，保存在需要的变量上
 * 3.给容器添加需要的状态
 */

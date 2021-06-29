import { reactive } from "vue"
import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'

function installModule (store, rootState, path, module){ //递归安装
	let isRoot = !path.length  // 空数组说明是根

	if(!isRoot){
		let parentState = path.slice(0, -1).reduce((state, key) => {
			return state[key]
		}, rootState)
		parentState[path[path.length - 1]] = module.state
	}

	
	module.forEachChild((child, key) => { //aCount bCount
		installModule(store, rootState, path.concat(key), child)
	})
}

export default class Store {
	constructor(options) {
		const store = this
		store._module = new ModuleCollection(options) // 格式化数据，树状结构

		//定义状态
		const state = store._module.root.state; // 根状态
		installModule(store, state, [], store._module.root) //安装state
		console.log(state)
	}

	

	install(app, injectKey){
		// vue3没有实例的概念， app是对象
		// 全局暴露一个变量， 暴露的是store的实例
		app.provide(injectKey || storeKey, this)
		
		// Vue.prototype.$store = this vue2的写法
		app.config.globalProperties.$store = this //增添￥store属性
	}
}

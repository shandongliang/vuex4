import { inject, reactive } from "vue"

const storeKey = "store"

export function forEachValue(obj, fn){
	Object.keys(obj).forEach(key=>fn(obj[key], key)) 	
}

class Store {
	constructor(options) {
		// vuex3内部会创造一个vue的实例，但是vuex4直接采用vue3提供的响应式方法
		// this.state = option.state  无法实现数据响应式
		const store = this
		store._state = reactive({data: options.state}) //reactive基于proxy实现响应式，data是为解决重新赋值的问题

		//实现getters
		const _getters = options.getters  // {double: function => getter}
		store.getters = {}

		forEachValue(_getters, function(fn, key){
			Object.defineProperty(store.getters, key, {
				//每次获取都需要重新执行计算，性能消耗，但现在在vuex中无法使用计算属性，
				//因为如果组件销毁会移除计算属性，vue3.2会修复这个bug
				get: () => fn(store.state) 
			})
		})


	}

	// 类的属性访问器
	get state () {
		return this._state.data
	}

	install(app, injectKey){
		// vue3没有实例的概念， app是对象
		// 全局暴露一个变量， 暴露的是store的实例
		app.provide(injectKey || storeKey, this)
		
		// Vue.prototype.$store = this vue2的写法
		app.config.globalProperties.$store = this //增添￥store属性
	}
}

export function createStore(option) {
	return new Store(option)
}
// vue内部已将这些api导出
export function useStore(injectKey = null) {
	//注入store
	return inject(injectKey !== null ? injectKey : storeKey )
}
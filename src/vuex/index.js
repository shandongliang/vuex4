import { inject, reactive } from "vue"

const storeKey = "store"
class Store {
	constructor(option) {
		// vuex3内部会创造一个vue的实例，但是vuex4直接采用vue3提供的响应式方法
		// this.state = option.state  无法实现数据响应式
		const store = this
		store._state = reactive({data: option.state}) //reactive基于proxy实现响应式，data是为解决重新赋值的问题
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
import Store from './store'
import { useStore } from './initIndex'

function createStore(options) {
	return new Store(options)
}


export {
    useStore,
    createStore
}
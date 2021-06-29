import Store from './store'
import { useStore } from './initIndex'

function createStore(option) {
	return new Store(option)
}


export {
    useStore,
    createStore
}
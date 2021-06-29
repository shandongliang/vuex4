
import { inject } from "vue"

export const storeKey = "store"

// vue内部已将这些api导出
export function useStore(injectKey = null) {
	//注入store
	return inject(injectKey !== null ? injectKey : storeKey )
}
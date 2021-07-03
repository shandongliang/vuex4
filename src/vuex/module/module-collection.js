import { forEachValue } from '../utils'
import Module from './module'

export default class ModuleCollection {
	constructor(rootModule){
		this.root = null
		this.register(rootModule, [])
	}

    // 根据path，往父节点上注册新的模块
	register(rawModule, path){
		const newModule = new Module(rawModule)
		if(path.length === 0){ //是一个根模块
			this.root = newModule
		} else {
			// const parent = this.root;
			// 获取需要挂载child的parent
			const parent = path.slice(0, -1).reduce((module, current) => {
				return module.getChild(current)
			}, this.root)
			// 挂载child
			parent.addChild(path[path.length - 1], newModule)
		}
		if(rawModule.modules){
			forEachValue(rawModule.modules, (rawChildModule, key) => {
				this.register(rawChildModule, path.concat(key))
			})
		}

        return newModule
	}

    // 增加命名空间
    getNamespaced(path){
        let module = this.root
        return path.reduce((namespaceStr, key) => {
            module = module.getChild(key)
            return namespaceStr + (module.namespaced ? key + '/' : '')
        },'')
    }
}
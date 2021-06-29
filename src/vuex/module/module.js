import { forEachValue } from '../utils'

export default class Module {
	constructor(rootModule){
		this._raw = rootModule
		this._children = {}
		this.state = rootModule.state
	}
	addChild (key, module){
		this._children[key] = module
	}
	getChild(key){
		return this._children[key]
	}
    forEachChild(fn){
        forEachValue(this._children, fn)
    }
}
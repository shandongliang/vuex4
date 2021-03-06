import { forEachValue } from '../utils'

export default class Module {
	constructor(rootModule){
		this._raw = rootModule
		this._children = {}
		this.state = rootModule.state
        this.namespaced = rootModule.namespaced
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

    forEachGetters(fn){
        if(this._raw.getters){
            forEachValue(this._raw.getters, fn)
        }
    }

    forEachMutations(fn){
        if(this._raw.mutations){
            forEachValue(this._raw.mutations, fn)
        }
    }
    
    forEachActions(fn){
        if(this._raw.actions){
            forEachValue(this._raw.actions, fn)
        }
    }
}
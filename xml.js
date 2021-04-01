import visit from "unist-util-visit-parents"

function makeNodeTest( re){
	return function nodeTest( node){
		if( node.children){
			return false
		}
		if( node.type!== "html"){
			return false
		}

		const got= re.exec( node.value)
		return got
	}
}

const
	openTest= makeNodeTest( /^<([\w-]+)/),
	closeTests= {}
let lastTag // !!
/** identify nodes which open an html tag but which do not close it */
function unflowedTest( node){
	const open= openTest( node)
	if( !open){
		return false
	}

	const tag= lastTag= open[ 1];
	let closeTest= closings[ tag]
	if( !closeTest){
		const re= new RegExp( `<(${open[ 1]}\s*>\s*$`)
		closeTest= closeTests[ tag]= makeNodeTest( re)
	}

	// check to see if this node closes
	if( closeTest(node.value)){
		return false
	}

	// return the tester to find the closing pair
	return closeTest
}

function *walkUntil(node, parents, test, depth= parents.length- 1){
	const parent= parents[ depth]

	// walk through this level
	let seen= node ? false : true
	for( let i= 0; i< parent.length; ){
		const sibling= parent[ i]
		let found= false
		if( !seen){
			// ignore results until we see `node`, they are "before"
			seen= sibling=== node
			++i
			continue
		}

		if( test( sibling)){
			// found target, yield & terminate successfully
			yield sibling
			found= true
		}else if( sibling.value){
			// a leaf along the way to finding our closing node
			if( sibling.children){
				throw new Error("unexpected node with value and children")
			}
			yield sibling
		}else{
			// at a non-leaf along the way to finding our terminator, yield what we find
			found= yield* walkUntil(null, [ sibling], test)
			// and if we found the terminator, terminate
		}
		delete parent[i]

		if( found){
			return true
		}
	}

	if( depth=== 0){
		// no more to walk
		return false
	}

	// we walked the current parent, try at the next level up
	return yield* walkUntil( parent, parents, test, depth- 1)
}


/** modify the ast to flow any disconnected xml/html */
function xmlFlow( ast){
	visit( ast, unflowedTest, function( node, parents){
		const closeTest= closeTests[ lastTag]

		let values= []
		for( let node of walkUntil( node, parents, closeTest)) {
			values.push( node.value)
		}

		node.value= values.join("")
	}, true)
}

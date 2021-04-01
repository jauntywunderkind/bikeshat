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
	let closeTest= closeTests[ tag]
	if( !closeTest){
		const re= new RegExp( `</\s*${open[ 1]}\s*>\s*$`)
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
	const parent_= parents[ depth]
	//console.log("  wu", node, parent_.length)

	// walk through this level
	let seen= node ? false : true
	for( let i= 0; i< parent_.children.length; ){
		console.log("    i", i, parent_.children.length)
		const sibling= parent_.children[ i]
		let found= false
		if( !seen){
			console.log("found self")
			// ignore results until we see `node`, they are "before"
			seen= sibling=== node
			++i
			continue
		}

		if( test( sibling)){
			console.log("^^final", sibling)
			// found target, yield & terminate successfully
			yield sibling
			found= true
		}else if( sibling.value){
			console.log("--sib")
			// a leaf along the way to finding our closing node
			if( sibling.children){
				throw new Error("unexpected node with value and children")
			}
			yield sibling
		}else{
			console.log('++non-leaf')
			// at a non-leaf along the way to finding our terminator, yield what we find
			found= yield* walkUntil(null, [ sibling], test)
			// and if we found the terminator, terminate
		}
		parent_.children.splice( i, 1)

		if( found){
			return true
		}
	}

	if( depth=== 0){
		// no more to walk
		return false
	}

	// we walked the current parent, try at the next level up
	return yield* walkUntil( parent_, parents, test, depth- 1)
}


/** modify the ast to flow any disconnected xml/html */
function xmlFlow( ast){
	visit( ast, unflowedTest, function( node, parents){

		console.log("WALK", node)
		const closeTest= closeTests[ lastTag]

		let values= []
		for( let w of walkUntil( node, parents, closeTest)) {
			console.log({w})
			values.push( w.value)
		}

		node.value= values.join("")
		console.log("walk over", node.value)
	}, true) // deleteing stuff so start from bottom
}
export default xmlFlow

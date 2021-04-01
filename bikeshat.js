import mdast from "mdast-util-from-markdown"

import filterHtml from "./pipeline/filter.js"
import innerHtml from "./html.js"
import xmlFlow from "./xml.js"
import fs from "fs"
const { readFile} = fs.promises

async function readInput(){
	const source = process.stdin.isTTY? process.argv[2]: "/dev/input"
	return readFile( source, "utf8")
}

async function main(){
	const input= await readInput()
	const ast= mdast( input)
	xmlFlow( ast)
	//const out= innerHtml( ast)
	console.log( JSON.stringify( ast, null, "\t"))
}
main()

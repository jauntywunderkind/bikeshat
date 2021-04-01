import unified from "unified"
import stream from "unified-stream"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import markdown from "remark-parse"
import remarkStringify from "remark-stringify"
import headerStack from "./pipeline/header.js"
import filterHtml from "./pipeline/filter.js"
import innerHtml from "./pipeline/html.js"
import fs from "fs"
const { readFile} = fs.promises

async function readInput(){
	const source = process.stdin.isTTY? process.argv[2]: "/dev/input"
	return readFile( source, "utf8")
}

const pipeline = unified()
	.use(markdown)
	//.use(innerHtml)
	.use(filterHtml)
	//.use(remarkRehype)
	//.use(rehypeRaw)
	//.use(markdown)
	.use(innerHtml)
	//.use(remarkStringify)
	//.use(function(a, b){ console.log("fuck", this, a, b) })

async function main(){
	//const out = pipeline.parse( await readInput())
	//console.log(out, "z")
	const input= await readInput()
	pipeline.process( input, function( err, out){
		console.log(JSON.stringify(out, null, "\t"), "xyz")
	})
}
main()

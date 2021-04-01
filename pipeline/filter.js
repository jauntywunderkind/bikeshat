import HeadingTracker from "remark-util-heading-tracker"

function snapshot( head){
	return {
		headings: {
			counts:[ ...head.counts],
			links:[ ...head.links],
			texts:[ ...head.texts]
		}
	}
}

export function filterHtml(){
	return function filter(tree){
		const head = new HeadingTracker()

		const children= tree.children.reduce( function( acc, child){
			head.visit( child);
			if ( child.type !== "html"){
				acc.push(child)
				return acc
			}

			acc.push({
				...child,
				data: {
					...child.data,
					...snapshot(head),
				}
			})

			return acc
		}, [])
		return {
			type: tree.type,
			children
		}
	}
}
export default filterHtml

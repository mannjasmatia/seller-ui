export function trimZeroValues(x:string[] | undefined, y:number[] | undefined) {

    if(!x || !y){
        return{x:[],y:[]}
    }

    // Check if there's at least one non-zero value
    if (!y?.some(value => value !== 0)) {
        return { x, y }; // Return original if all zeros
    }
    
    const firstNonZero = y.findIndex(value => value !== 0);
    const lastNonZeroItem = y.map((value, index) => ({ value, index }))
                           .reverse()
                           .find(item => item.value !== 0);
    const lastNonZero = lastNonZeroItem ? lastNonZeroItem.index : -1;
    
    return {
        x: x.slice(firstNonZero, lastNonZero + 1),
        y: y.slice(firstNonZero, lastNonZero + 1)
    };
}

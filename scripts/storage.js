/**
 * Created by siobhan on 15/09/14.
 */
function store(name, item){
    localStorage.setItem(name, JSON.stringify(item));
}

function retrieve(name){
    return JSON.parse( localStorage.getItem( name ));
}
/**
 * Created by siobhan on 15/09/20.
 */

var participantKey = "CurrentParticipant";
var timer;
var autosubmit = false;


function store(name, item){
    var current = retrieve();

    current[name] = item;

    localStorage.setItem(participantKey, JSON.stringify(current));
}

function retrieve(){
    var current =  JSON.parse( localStorage.getItem( participantKey ));
    if(current == null){
        current = {};
    }
    return current;
}

function getSingle(key){
    var current =  JSON.parse( localStorage.getItem( key ));
    //if(current == null){
    //    current = {};
    //}
    return current;
}

function getGroup(){
    var name = retrieve()["participantNo"];
    return name.slice(0, 1);
}

function deleteAll(){
    var keys = [];

    //get storage keys
  $.each(localStorage, function(key, val) {
    keys.push(key);
  });

  //loop through keys
  for( var i=0; i<keys.length; i++ ){
    var key = keys[i];

    //delete key
      localStorage.removeItem(key)
  }
}


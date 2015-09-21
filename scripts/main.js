/**
 * Created by siobhan on 15/09/20.
 */

var participantKey = "CurrentParticipant";


$(function()
{

    //class definition to allow certain buttons to NOT output
    //load dissuasion message below
    $('.no-load-prompt').click(
        function() {
            disableLoadMsg();
        });

    $('.no-load-prompt').submit(
        function() {
            disableLoadMsg();
        });

    //output to dissuade people to close/refresh current page
    window.onbeforeunload = function(){
        return "Leaving this page may result in losing experimental results.";
    };

    //disables clicking on back button
    //UNLESS user holds back button down
    history.pushState(null, null, location.href);
    window.onpopstate = function(event) {
        history.go(1);
    };
});

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

//
//function downloadAll(){
//    var keys = [];
//
//    //get storage keys
//    $.each(localStorage, function(key, val) {
//        keys.push(key);
//    });
//
//  //loop through keys
//    for( var i=0; i<keys.length; i++ ){
//        var key = keys[i];
//
//    //check if key excluded
//
//    //delete key
//        // encode the data into base64
//        var base64 = window.btoa(localStorage.getItem(key));
//
//        // create an a tag
//        var a = document.createElement('a');
//        a.href = 'data:application/octet-stream;base64,' + base64;
//        a.innerHTML = 'Download';
//
//        // add to the body
//        document.body.appendChild(a);
//    }
//}


function disableLoadMsg(){
    window.onbeforeunload = null;
}


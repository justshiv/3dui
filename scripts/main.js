/**
 * Created by siobhan on 15/09/20.
 */

$(function()
{

    $('.no-load-prompt').click(
        function() {

            disableLoadMsg();

        });

});

function store(name, item){
    localStorage.setItem(name, JSON.stringify(item));
}

function retrieve(name){
    return JSON.parse( localStorage.getItem( name ));
}

function getGroup(){
    var name = retrieve("participantNo");
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

    //check if key excluded

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

window.onbeforeunload = function(){
    return "Leaving this page may result in losing experimental results.";
};


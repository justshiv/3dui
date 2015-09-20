/**
 * Created by siobhan on 15/09/20.
 */

function store(name, item){
    localStorage.setItem(name, JSON.stringify(item));
}

function retrieve(name){
    return JSON.parse( localStorage.getItem( name ));
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

window.onbeforeunload = function(){
    return "Leaving this page may result in losing experimental results. Are you sure you want to exit?";
}

$(function()
        {

            $('.no-load-prompt').click(
                function() {

                    window.onbeforeunload = null;

                });

        });
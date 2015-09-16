/**
 * Created by siobhan on 15/08/30.
 */


function onDocumentMouseDown( event ) {
    event.preventDefault();

    if ( objstate === OBJSTATE.NONE )
    {

        if(translate == true){
            objstate = OBJSTATE.MOVE;
        }

        if(rotate == true){
            objstate = OBJSTATE.ROTATE;
        }
    }

    if(objstate === OBJSTATE.ROTATE){
        if(INTERSECTED){
            SELECTED = INTERSECTED;
            lockControls();
            container.style.cursor = 'alias';
        }

        drawRotHelpers(SELECTED);

    }
    else if(objstate === OBJSTATE.MOVE){
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, CURRENTCAM );
        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            lockControls();

            SELECTED = intersects[ 0 ].object;

            intersects = raycaster.intersectObject( movementPlane );
            offset.copy( intersects[ 0 ].point ).sub( movementPlane.position );
            container.style.cursor = 'move';

        }
    }

    //console.log(objstate);
}

function onDocumentMouseUp( event ) {
    event.preventDefault();

    if(objstate === OBJSTATE.MOVE){

        if ( INTERSECTED ) {
            movementPlane.position.copy( INTERSECTED.position );
            SELECTED = null;
            INTERSECTED = null;
        }
    }
    else if(objstate === OBJSTATE.ROTATE){

        if ( INTERSECTED ) {
            SELECTED = null;
            INTERSECTED = null;
        }
    }
    releaseControls();

    container.style.cursor = '-webkit-grab';


    objstate = OBJSTATE.NONE;
}

    function rot(){
        if( $('#rotate').hasClass('active')){
             $('#rotate').removeClass('active');
            rotate = false;
        }
        else{
            $('#translate').removeClass('active');
            $('#rotate').addClass('active');
            translate = false;
            rotate = true;
        }
    }
    function trans(){
        if( $('#translate').hasClass('active')){
             $('#translate').removeClass('active');
            translate = false;
        }
        else{
            $('#rotate').removeClass('active');

            hideRotHelpers();
            $('#translate').addClass('active');
            rotate = false;
            translate = true;
        }
    }
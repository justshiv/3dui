/**
 * Created by siobhan on 15/08/30.
 */


function onDocumentMouseDown( event ) {
    event.preventDefault();

    if ( objstate === OBJSTATE.NONE )
    {
        if ( event.button === 0 )
            objstate = OBJSTATE.ROTATE;

        if ( event.button === 2 )
            objstate = OBJSTATE.MOVE;
    }

    if(objstate === OBJSTATE.ROTATE){

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

    console.log(objstate);
}

function onDocumentMouseUp( event ) {
    event.preventDefault();

    if(objstate === OBJSTATE.MOVE){
        releaseControls();

        if ( INTERSECTED ) {
            movementPlane.position.copy( INTERSECTED.position );
            SELECTED = null;
        }
        container.style.cursor = '-webkit-grab';
    }
    objstate = OBJSTATE.NONE;

}
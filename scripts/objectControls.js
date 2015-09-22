/**
 * Created by siobhan on 15/08/30.
 */

var mouseRotStart = new THREE.Vector2();
var mouseRotEnd = new THREE.Vector2();
var radius = 50;
var rotateQuarts;

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

            //mouseRotStart.copy(mouse);

            SELECTED = INTERSECTED;
            lockControls();
            container.style.cursor = 'alias';

            drawRotHelpers(SELECTED);

        }


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

        if ( INTERSECTED ) {
            movementPlane.position.copy( INTERSECTED.position );
            SELECTED = null;
            INTERSECTED = null;
        }
    }
    else if(objstate === OBJSTATE.ROTATE){

        //if ( INTERSECTED ) {
            SELECTED = null;
            INTERSECTED = null;
        //}
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

function calculateRotation (model){
        //mouseRotStart = mouseToWorldObj (x, y, camera)
        //mouseRotStart3d = mouseToWorldObj(mouseRotStart.x, mouseRotStart.y, model, CURRENTCAM);
        //mouseRotEnd3d = mouseToWorldObj(mouseRotEnd.x, mouseRotEnd.y, model, CURRENTCAM);

        rotateQuarts = rotateQuaternion(mapToSphere(mouseRotStart.x, mouseRotStart.y, radius), mapToSphere(mouseRotEnd.x, mouseRotEnd.y, radius));
        rotateModelyByQuarternion(model, rotateQuarts);
        //mouseRotStart = mouseRotEnd;
}

function rotateModelyByQuarternion(model, rotate){

    var currQuaternion = model.quaternion;
    currQuaternion.multiplyQuaternions(rotate, currQuaternion);
    currQuaternion.normalize();
    model.setRotationFromQuaternion(currQuaternion);
}

function rotateQuaternion(rotateStart, rotateEnd){
    var axis = new THREE.Vector3();
    var rotate = new THREE.Quaternion();
    var angle = Math.acos(rotateStart.dot(rotateEnd) / rotateStart.length() / rotateEnd.length());

    if(angle){
        axis.crossVectors(rotateStart, rotateEnd).normalize();
        rotate.setFromAxisAngle(axis, angle);
    }
    return rotate;
}

function mapToSphere(x, y, radius){
    var pointOnSphere = new THREE.Vector3(x / radius, y / radius, 0);
    var length = pointOnSphere.length();

    if(length >= 1){
        pointOnSphere.normalize();
    } else {
        pointOnSphere.z = Math.sqrt(1.0 - (length * length));
    }
    return pointOnSphere;
}


function mouseToWorldObj (x, y, model, camera){

    var vector = new THREE.Vector3(x, y, 0.5);

    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = - camera.position.z/dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));

    var finalPos =  new THREE.Vector3(pos.x - model.position.x, pos.y - model.position.y, pos.z - model.position.z);
    console.log(pos);
    return finalPos;
}


/**
 * Created by siobhan on 15/08/30.
 */

var mouseRotStart = new THREE.Vector3();
var mouseRotEnd = new THREE.Vector3();
var radius = 200;
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

            var castRotRay = new THREE.Raycaster();

            if(interfaceType == "shadowbox" &&  CURRENTCAM != mainCamera){
                //figure out which side we're on and adjust the mouse as such
                castRotRay.setFromCamera( mouse, mainCamera );
                intersects = castRotRay.intersectObjects(planes);

                if(intersects.length > 0){
                    mouse.copy(getInterfaceSpecificMouse(intersects[0].point));
                }
            }

            castRotRay.setFromCamera( mouse, CURRENTCAM );
            intersects = castRotRay.intersectObject( movementPlane );
            if(intersects.length > 0){
                mouseRotStart.copy( intersects[ 0 ].point.sub( offset ) );
                mouseRotEnd.copy( intersects[ 0 ].point.sub( offset ) );
            }

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
            //mouseRotStart = new THREE.Vector3();
            //mouseRotEnd = new THREE.Vector3();
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
        //console.log(CURRENTCAM);
        //console.log("StartB: ", mouseRotStart.x, mouseRotStart.y, mouseRotStart.z);
        //console.log("EndB: ",mouseRotEnd.x, mouseRotEnd.y, mouseRotEnd.z);

        mouseRotStart3d = mouseToWorldObj(mouseRotStart.x, mouseRotStart.y, mouseRotStart.z, model, CURRENTCAM);
        mouseRotEnd3d = mouseToWorldObj(mouseRotEnd.x, mouseRotEnd.y, mouseRotEnd.z,  model, CURRENTCAM);

        var resetStart = resetAxes(mouseRotStart3d);
        var resetEnd = resetAxes(mouseRotEnd3d);

        var rotCamStart = mapToSphere(resetStart.x, resetStart.y, radius);
        var rotCamEnd = mapToSphere(resetEnd.x, resetEnd.y, radius);

        rotateQuarts = rotateQuaternion(rotateToCamera(rotCamStart, CURRENTCAM, true), rotateToCamera(rotCamEnd, CURRENTCAM, true) );
        console.log("quart", rotateQuarts);

        if(interfaceType == "shadowbox" && CURRENTCAM.getWorldDirection().equals(new THREE.Vector3(0, 0, 1))){
            rotateQuarts.w = -rotateQuarts.w;
        }
        rotateModelyByQuarternion(model, rotateQuarts);
}

function resetAxes(mouseObj){
    return rotateToCamera(mouseObj, CURRENTCAM, false);
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

function rotateToCamera(pointOnSphere, camera, to){
    //camera's vector toward's centre

    var startVec = new THREE.Vector3();

    startVec.copy(camera.getWorldDirection());
    startVec.negate();

    console.log(startVec);

    if(startVec.equals(new THREE.Vector3(-0, -0, -1)) ){
        startVec = new THREE.Vector3(-0, -0, 1);
        //to = !to;
    }

    var quat;
    if(to){
        quat = rotateQuaternion(new THREE.Vector3(0,0,1), startVec);
    } else {
        quat = rotateQuaternion(startVec, new THREE.Vector3(0,0,1));
    }

    var result = new THREE.Vector3();
    result.copy(pointOnSphere);
    result.applyQuaternion(quat);
    return result;
}

function mapToSphere(x, y, radius){

    //console.log(x , y);

    var pointOnSphere = new THREE.Vector3(x / radius, y / radius, 0);
    var length = pointOnSphere.length();

    if(length >= 1){
        pointOnSphere.normalize();
    } else {
        pointOnSphere.z = Math.sqrt(1.0 - (length * length));
    }

    return pointOnSphere;
}


function mouseToWorldObj (x, y, z, model, camera){
    //vector of camera to 0,0,0

    //calculate quarternion that takes 0, 0, 1
    var finalPos =  new THREE.Vector3(x - model.position.x, y - model.position.y, z - model.position.z);
    return finalPos;
}


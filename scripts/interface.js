/**
 * Created by siobhan on 15/08/30.
 */


        $(function () {
          $('[data-toggle="tooltip"]').tooltip()

            startTiming();
        });

        //stuff that never changes
        var interfaceType = "";
        var taskNo = 0;
        var totalTasks = 16;
        var container = document.getElementById( 'canvas-container' );
        var boxSide = 1000;
        var OBJSTATE = { NONE: -1, ROTATE: 0, MOVE: 2 };
        var colors = [
            new THREE.Color("rgb(107, 110, 207)"),
            new THREE.Color("rgb(181, 207, 107)"),
            new THREE.Color("rgb(231, 186, 82)"),
            new THREE.Color("rgb(214, 97, 107)"),
            new THREE.Color("rgb(206, 109, 189)")
        ];
        interfaceCounter = 0;

        // standard global variables

        var scene, renderer, controls;

        // custom global variables
        var backCamera, leftCamera, bottomCamera, topCamera, rightCamera, frontCamera, mainCamera;
        var screenScene, screenCamera, firstRenderTarget,topRenderTarget, bottomRenderTarget, frontRenderTarget, backRenderTarget, rightRenderTarget, leftRenderTarget;
        var gridXZ, gridYZ, gridXY;
        var mouse, offset, INTERSECTED, SELECTED, CURRENTCAM;
        var objects, targets;
        var planes, movementPlane;
        var selectedEdge;

        var objstate = OBJSTATE.NONE;
        var translate = false;
        var rotate = false;

        var circle, rotx, roty, rotz;

        // global attributes needed for scene
        //special for standard interface
        var camera;
        var CURRENTVIEW;

        var views, tasktype;

        var startTime;

    function setupInterface(){
        startTime = new Date().getTime();

        mouse = new THREE.Vector2();
        offset = new THREE.Vector3();

        targets = [];
        objects = [];
        planes = [];
        //*** SCENE & LIGHTS ***//
        scene = new THREE.Scene();
        scene.add( new THREE.AmbientLight( 0x505050 ) );
        scene.add(new THREEx.ThreePointsLighting());


        var instr = "";
        if(interfaceCounter == 0){
            interfaceCounter++;
            alignScene();
            tasktype = "alignScene";
            instr = "Instructions: Align the letters with the plane";
        }
        else if(interfaceCounter == 1){
            interfaceCounter++;
            dodecahedronScene();
            tasktype = "dodecahedronScene";
            instr = "Instructions: Align the letters with the cutouts in the dodecahedron in the middle";
        }
        else{
            interfaceCounter = 0;
            roomScene();
            tasktype = "roomScene";
            instr = "Instructions: Put the table on the floor, and the vase on the table";
        }

        document.getElementById("instruction").innerHTML = instr;

        //*** DISPLAY STRUCTURE ***//
        gridXZ = new THREE.GridHelper((boxSide/2), 100);
        gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
        gridXZ.position.set( 0,0,0 );
        scene.add(gridXZ);

        gridXY = new THREE.GridHelper((boxSide/2), 100);
        gridXY.position.set( 0,0,0 );
        gridXY.rotation.x = Math.PI/2;
        gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
        scene.add(gridXY);

        gridYZ = new THREE.GridHelper((boxSide/2), 100);
        gridYZ.position.set( 0,0,0 );
        gridYZ.rotation.z = Math.PI/2;
        gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
        scene.add(gridYZ);

        var axes = new THREE.AxisHelper(300);
        scene.add( axes );

        circle = new THREE.CircleGeometry(100, 64);

        rotx = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0x0000ff}));
        scene.add(rotx);

        roty = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0x00ff00}));
        roty.rotation.x = Math.PI/2;
        scene.add(roty);

        rotz = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0xff0000}));
        rotz.rotation.y = Math.PI/2;
        scene.add(rotz);

        hideRotHelpers();

        //plane that enables drag/drop interaction with geometry
        movementPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 10000, 10000, 0, 0 ),
            new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
        );
        movementPlane.visible = false;
        scene.add( movementPlane );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( new THREE.Color("#cecece") );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( container.offsetWidth, container.offsetHeight );
        renderer.sortObjects = false;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;

        if(container.childNodes.length > 0){
            container.replaceChild( renderer.domElement, container.childNodes[0] );
        }
        else{
            container.appendChild(renderer.domElement);
        }

        //dom and window listeners
        renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
        window.addEventListener( 'resize', onWindowResize, false );
    }

    function cursorPositionInCanvas(canvas, event) {

        var canoffsetLeft = canvas.documentOffsetLeft;
        var canoffsetTop = canvas.documentOffsetTop;

        var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffsetLeft);
        var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffsetTop) + 1;

        var mousePos = new THREE.Vector2();
        mousePos.x = (x/ (container.offsetWidth)) * 2 - 1;
        mousePos.y = - (y/ (container.offsetHeight)) * 2 + 1;

        return mousePos;
    }

    //retrieved from stackoverflow
    window.Object.defineProperty( Element.prototype, 'documentOffsetTop', {
        get: function () {
            return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
        }
    } );
    window.Object.defineProperty( Element.prototype, 'documentOffsetLeft', {
        get: function () {
            return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
        }
    } );

function drawRotHelpers(currObject){
    rotx.visible = true;
    roty.visible = true;
    rotz.visible = true;

    rotx.position.copy( currObject.position );
    roty.position.copy( currObject.position );
    rotz.position.copy( currObject.position );
}

function hideRotHelpers(){
    rotx.visible = false;
    roty.visible = false;
    rotz.visible = false;
}

var taskDataArr = [];

function submit(){
    var timeTaken = new Date().getTime() - startTime;
    //var accuracy = calculateAccuracy();

    var subObjectsArr = [];
    var subTargetsArr = [];

    for(var i = 0; i < targets.length; i++){
        var subObject = {
            type: "object",
            position: objects[0].position,
            quarternion: objects[0].quarternion,
            rotation: objects[0].rotation,
            up: objects[0].up

        };
        var subTarget = {
            type: "target",
            position: objects[0].position,
            quarternion: objects[0].quarternion,
            rotation: objects[0].rotation,
            up: objects[0].up

        };
        subObjectsArr.push(subObject);
        subTargetsArr.push(subTarget);
    }

    var submissionData = {
        taskNo: taskNo,
        taskType: tasktype,
        timeTaken: timeTaken,
        objects: subObjectsArr,
        targets: subTargetsArr
    };

    taskDataArr.push(submissionData);
    loadTask();
}

function loadTask(){
    taskNo++;

    if(taskNo == totalTasks){
        store(interfaceType + "-tasks", taskDataArr);
        window.location = "sus-quest.html?" + interfaceType;
    }

    //resetting
    init();

    var title =  document.getElementById("taskNo");
    title.innerHTML = "Task " + taskNo;
}

function calculateAccuracy(){

    var difference = 0;

    for(var i = 0; i < targets.length; i++){
        var currDiff = 0;
        currDiff = targets[i].position.distanceTo(objects[i].position);
        difference += currDiff;
    }
    difference = Math.floor(difference/targets.length);

    return difference;
}

function dodecahedronScene(){

    var geometry = new THREE.DodecahedronGeometry(250, 0);
    //var material = new THREE.MeshPhongMaterial( {side: THREE.BackSide, color: new THREE.Color("#78abd9"), shading: THREE.FlatShading} );
    var material = new THREE.MeshPhongMaterial( { transparent: true, opacity: 0.93, color: new THREE.Color("#78abd9"), shading: THREE.FlatShading} );
    var dodeca = new THREE.Mesh(geometry, material);
    var wireframe = new THREE.EdgesHelper( dodeca, new THREE.Color("#708090"));

    geometry.mergeVertices();
    console.log(geometry.faces.length);

    dodeca.position.set(0,0,0);
    scene.add(dodeca);
    scene.add(wireframe);

    // add 3D text
    var items = [ "F", "G", "J", "L", "P", "Q", "R", "1", "2", "3", "4", "5", "7", "9"];

    for(var i = 0; i < 3; i++){

        var random_item = items[Math.floor(Math.random() * items.length)];

        var objMaterial = new THREE.MeshLambertMaterial( { color: colors[i] } );
        var objGeom = new THREE.TextGeometry( random_item,
        {
            size: 150, height: 10, curveSegments: 20,
            font: "droid sans", weight: "normal", style: "normal",
            bevelThickness: 5, bevelSize: 5, bevelEnabled: true,
            material: 0, extrudeMaterial: 1
        });
        objGeom.center();

        var object = new THREE.Mesh(objGeom, objMaterial );
        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600 - 300;
        object.position.z = Math.random() * 800 - (boxSide/2);
        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add( object );
        objects.push( object );

        var targetMaterial = new THREE.MeshPhongMaterial( {side: THREE.BackSide,  color: new THREE.Color("#999999") , shading: THREE.FlatShading } );
        var targetGeom = new THREE.TextGeometry( random_item,
        {
            size: 150, height: 1, curveSegments: 20,
            font: "droid sans", weight: "normal", style: "normal",
            bevelThickness: 1, bevelSize: 5, bevelEnabled: true,
            material: 0, extrudeMaterial: 1
        });
        targetGeom.center();

        var target = new THREE.Mesh(targetGeom, targetMaterial );

        target.castShadow = true;
        target.receiveShadow = true;
        scene.add( target );
        targets.push(target);
    }

    targets[0].position.x = 174;
    targets[0].position.y = 100;
    targets[0].position.z = 0;
    targets[0].rotation.x = -Math.PI/2;
    targets[0].rotation.y =  1.018;
    targets[0].rotation.z = Math.PI/2;

    targets[1].position.x = -174;
    targets[1].position.y = 100;
    targets[1].position.z = 0;
    targets[1].rotation.x = -Math.PI/2;
    targets[1].rotation.y =  -1.018;
    targets[1].rotation.z = -Math.PI/2;

    targets[2].position.x = 0;
    targets[2].position.y = -174;
    targets[2].position.z = 100;
    targets[2].rotation.x =  1.018;

}

function roomScene(){
    //var group = new THREE.Object3D();//create an empty container
    //group.position.set(0, 0, 0);

    var geometry = new THREE.BoxGeometry( 200, 10, 100 );
    var material = new THREE.MeshBasicMaterial( {color: new THREE.Color("#CC9966")} );
    var tabletop = new THREE.Mesh( geometry, material );
    tabletop.position.set(0, 50, 0);

    geometry = new THREE.CylinderGeometry( 10, 5, 90, 30, 1 );
    //material = new THREE.MeshBasicMaterial( {color: new THREE.Color("#CC9966")} );
    var rightLeg = new THREE.Mesh( geometry, material );
    rightLeg.position.set(50, 0, 0);

    var leftLeg = new THREE.Mesh( geometry, material );
    leftLeg.position.set(-50, 0, 0);

    var combinedGeom = new THREE.Geometry();
    tabletop.updateMatrix();
    combinedGeom.merge(tabletop.geometry, tabletop.matrix);
    rightLeg.updateMatrix();
    combinedGeom.merge(rightLeg.geometry, rightLeg.matrix);
    leftLeg.updateMatrix();
    combinedGeom.merge(leftLeg.geometry, leftLeg.matrix);
    combinedGeom.center();

    var combined = new THREE.Mesh(combinedGeom, material);
    var wireframe = new THREE.EdgesHelper( combined, new THREE.Color("#996633"));

    scene.add( combined );
    scene.add( wireframe );
    objects.push(combined);

    geometry = new THREE.BoxGeometry( 300, 5, 300 );
    geometry.center();
    var texture = THREE.ImageUtils.loadTexture( "../images/floor-tile.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    material = new THREE.MeshBasicMaterial( {map:texture, side:THREE.DoubleSide} );
    var floor = new THREE.Mesh( geometry, material );
    floor.position.set(0, 0, 0);
    scene.add(floor);
    objects.push(floor);
}

function alignScene(){

        var letters = ["G", "J", "P", "Q", "R"];

        for(var i = 0; i < letters.length; i++){
            var materialFront = new THREE.MeshLambertMaterial( { color: colors[i]} );
            var textGeom = new THREE.TextGeometry( letters[i],
            {
                size: 150, height: 10, curveSegments: 20,
                font: "droid sans", weight: "normal", style: "normal",
                bevelThickness: 5, bevelSize: 5, bevelEnabled: true,
                material: 0, extrudeMaterial: 1
            });
            textGeom.center();

            var object = new THREE.Mesh(textGeom, materialFront );
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600 - 300;
            object.position.z = Math.random() * 800 - 400;
            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;
            object.castShadow = true;
            object.receiveShadow = true;
            scene.add( object );
            objects.push( object );
        }

        var geometry = new THREE.BoxGeometry( 600, 5, 400 );
        geometry.center();
        var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.7, color: new THREE.Color("#000000")} );
        var floorplane = new THREE.Mesh( geometry, material );
        floorplane.position.set(0, 200, 0);

        floorplane.rotation.x = -Math.PI/2;
        floorplane.rotation.y =  -1.018;
        floorplane.rotation.z = -Math.PI/2;

        scene.add(floorplane);
        targets.push(floorplane);
}

function trainingScene(){
    //timer

    //instructions

    //

}

function startTiming(){
    var display = document.querySelector('#time');
    var timer = new CountDownTimer(1 * 3, display);
    timer.start();
}

function proceed(){
    document.getElementById("timer-div").style.display = "none";
    document.getElementById("submit").style.display = "inline-block";
    submit();
}

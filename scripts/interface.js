/**
 * Created by siobhan on 15/08/30.
 */


        $(function () {
          $('[data-toggle="tooltip"]').tooltip()
        });

        // standard global variables
        var container = document.getElementById( 'canvas-container' );

        var scene, renderer, controls;

        // custom global variables
        var movementPlane;
        var backCamera, leftCamera, bottomCamera, topCamera, rightCamera, frontCamera, mainCamera;
        var screenScene, screenCamera, firstRenderTarget,topRenderTarget, bottomRenderTarget, frontRenderTarget, backRenderTarget, rightRenderTarget, leftRenderTarget;
        var gridXZ, gridYZ, gridXY;
        var mouse = new THREE.Vector2(), offset = new THREE.Vector3(), INTERSECTED, SELECTED, CURRENTCAM;
        var objects = [], planes = [], colors = [];
        var selectedEdge;

        var boxSide = 800;

        var OBJSTATE = { NONE: -1, ROTATE: 0, MOVE: 2 };
        var objstate = OBJSTATE.NONE;

        var circle, rotx, roty, rotz;

        // global attributes needed for scene
        //special for standard interface
        var camera;
        var CURRENTVIEW;


        var views = [
            {
                name: "perspective",
                left: 0,
                bottom: 0.5,
                width: 0.5,
                height: 0.5,
                background: new THREE.Color("#cecece"),
                eye: [ 1000, 1000, 1000 ],
                up: [ 0, 1, 0 ],
                fov: 45,
                camera : new THREE.PerspectiveCamera( this.fov, container.offsetWidth / container.offsetHeight, 1, 10000 )
            }
            ,
            {
                name: "top",
                left: 0,
                bottom: 0,
                width: 0.5,
                height: 0.5,
                background: new THREE.Color("#cecece"),
                eye: [ 0, 1000, 0 ],
                up: [ 0, 1, 0 ],
                fov: 45,
                camera : new THREE.OrthographicCamera(container.offsetWidth / -1, container.offsetWidth, container.offsetHeight, container.offsetHeight / -1, 1, 10000 )
            }
            ,
            {
                name: "front",
                left: 0.5,
                bottom: 0,
                width: 0.5,
                height: 0.5,
                background: new THREE.Color("#cecece"),
                eye: [ 0, 0, 1000 ],
                up: [ 0, 1, 0  ],
                fov: 45,
                camera : new THREE.OrthographicCamera(container.offsetWidth / -1, container.offsetWidth, container.offsetHeight, container.offsetHeight / -1, 1, 10000 )
            }
            ,
            {
                name: "side",
                left: 0.5,
                bottom: 0.5,
                width: 0.5,
                height: 0.5,
                background: new THREE.Color("#cecece"),
                eye: [ 1000, 0, 0 ],
                up: [ 0, 1, 0 ],
                fov: 45,
                camera : new THREE.OrthographicCamera(container.offsetWidth / -1, container.offsetWidth, container.offsetHeight, container.offsetHeight / -1, 1, 10000 )
            }
        ];





    function setupInterface(){
        //*** SCENE & LIGHTS ***//
        scene = new THREE.Scene();
        scene.add( new THREE.AmbientLight( 0x505050 ) );
        scene.add(new THREEx.ThreePointsLighting());

        //*** DISPLAY STRUCTURE ***//
        gridXZ = new THREE.GridHelper(400, 100);
        gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
        gridXZ.position.set( 0,0,0 );
        scene.add(gridXZ);

        gridXY = new THREE.GridHelper(400, 100);
        gridXY.position.set( 0,0,0 );
        gridXY.rotation.x = Math.PI/2;
        gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
        scene.add(gridXY);

        gridYZ = new THREE.GridHelper(400, 100);
        gridYZ.position.set( 0,0,0 );
        gridYZ.rotation.z = Math.PI/2;
        gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
        scene.add(gridYZ);

        var axes = new THREE.AxisHelper(300);
        scene.add( axes );

        circle = new THREE.CircleGeometry(70, 64);

        rotx = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0xff0000}));
        scene.add(rotx);

        roty = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0x00ff00}));
        roty.rotation.x = Math.PI/2;
        scene.add(roty);

        rotz = new THREE.Line(circle, new THREE.LineBasicMaterial({color: 0x0000ff}));
        rotz.rotation.y = Math.PI/2;
        scene.add(rotz);

        //plane that enables drag/drop interaction with geometry
        movementPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 10000, 10000, 0, 0 ),
            new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
        );
        movementPlane.visible = false;
        scene.add( movementPlane );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( 0xf0f0f0 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( container.offsetWidth, container.offsetHeight );
        renderer.sortObjects = false;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;
        container.appendChild( renderer.domElement );

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
    //
    function rotate(){
        objstate = OBJSTATE.ROTATE;
        if( $('#rotate').hasClass('active')){
             $('#rotate').removeClass('active');
        }
        else{
            $('#translate').removeClass('active');
            $('#rotate').addClass('active');
        }
    }

    function trans(){
        objstate = OBJSTATE.NONE;
        if( $('#translate').hasClass('active')){
             $('#translate').removeClass('active');
        }
        else{
            $('#rotate').removeClass('active');
            $('#translate').addClass('active');
        }
    }
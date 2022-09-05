import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CameraType, ViewportSide } from "./enums"
import { WebViewer } from "./webviewer"

// https://threejs.org/manual/?q=multipl#en/multiple-scenes

export class SceneController{
  private webviewer: WebViewer;
  scene: THREE.Scene;
  controls: OrbitControls;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  persp_camera: THREE.PerspectiveCamera;
  ortho_camera: THREE.OrthographicCamera;
  canvas_width: number;
  canvas_height: number;
  client_width: number;
  client_height: number;
  viewport_left: number = 0;
  viewport_yup: number = 0;
  
  private side: ViewportSide = ViewportSide.total;
  
  constructor(webviewer: WebViewer, side: ViewportSide) {
    this.webviewer = webviewer;
    this.side = side;
    this.scene = new THREE.Scene();
    this.persp_camera = this.add_perspective_camera();
    this.ortho_camera = this.add_orthogonal_camera();
    this.camera = this.persp_camera;
    this.add_orbit_controls(this.persp_camera);
    this.add_orbit_controls(this.ortho_camera);
    this.set_lights();
    this.add_axes_helper();
    this.add_grid_helper();
    this.add_default_box();
    this.update();
  }

  dispose(): void {
  }
 
  private add_orbit_controls(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void {
    this.controls = new OrbitControls(camera, this.webviewer.get_renderer().domElement);
    //this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    // this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.addEventListener("change", this.orbiting_cb);
    this.controls.dampingFactor = 0.2;
    this.controls.enableDamping = true;
    this.controls.screenSpacePanning = false;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 0.6;
  }
  
  private orbiting_cb = (): void => {
    // things to do while orbiting, like updating compasses etc...
  };

   add_perspective_camera(type: CameraType = CameraType.perspective): THREE.PerspectiveCamera{
    const webgl_canvas = this.webviewer.get_webgl_canvas();
    let camera = new THREE.PerspectiveCamera(
      75,
      webgl_canvas.clientWidth / webgl_canvas.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 2;
    return camera;
  }

  add_orthogonal_camera(): THREE.OrthographicCamera{
    let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 2;
    return camera;
  }

  render(): void {
    const renderer = this.webviewer.get_renderer();
    renderer.setScissor(this.viewport_left,
                        this.viewport_yup,
                        this.client_width,
                        this.client_height);
    renderer.setViewport(this.viewport_left,
                         this.viewport_yup,
                         this.client_width,
                         this.client_height);
 
    renderer.render(this.scene, this.camera);
  }

  update_client_size():void {
    const webgl_canvas: HTMLElement = this.webviewer.get_webgl_canvas();
    this.canvas_width = webgl_canvas.clientWidth;
    this.canvas_height = webgl_canvas.clientHeight;
    switch (this.side){
      case ViewportSide.total:{
        this.client_width = this.canvas_width;
        this.client_height = this.canvas_height;
        this.viewport_left = 0;
        this.viewport_yup = 0;
        break;
      }
      case ViewportSide.left:{
        this.client_width = this.canvas_width / 2;
        this.client_height = this.canvas_height;
        this.viewport_left = 0;
        this.viewport_yup = 0;
        break;
       }
      case ViewportSide.right:{
        this.client_width = this.canvas_width / 2;
        this.client_height = this.canvas_height;
        this.viewport_left = this.client_width;
        this.viewport_yup = 0;
        break;
      } 
    }
  }
  
  update(): void {
    this.update_client_size();
    this.set_camera_aspect();
  }
  
  set_camera_aspect(): void {
   
    const aspect: number = this.client_width / this.client_height;
    this.persp_camera.aspect = this.client_width / this.client_height;
    this.persp_camera.updateProjectionMatrix();
    let w: number = -1;
    let h: number = -1;
    if (aspect >= 1) {
      h = this.ortho_camera.top - this.ortho_camera.bottom;
      w = h * aspect;
    } else {
      w = this.ortho_camera.right - this.ortho_camera.left;
      h = w / aspect;
    }
    this.ortho_camera.left = w / -2;
    this.ortho_camera.right = w / 2;
    this.ortho_camera.top = h / 2;
    this.ortho_camera.bottom = h / -2;
    this.ortho_camera.updateProjectionMatrix();
  }

  private set_lights(): void {
    const ambient: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const main: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    main.position.set(100, 100, 200);
    main.castShadow = false;
    this.scene.add(ambient);
    this.scene.add(main);
  }
  
  clearObject3d(object: THREE.Object3D | null) {
    while (object && object.children.length > 0) {
      object.remove(object.children[0]);
    }
    object = null;
  }

  camera_fit(camera:THREE.PerspectiveCamera, obj:THREE.Object3D, offset: number, controls:OrbitControls){
    offset = offset || 1.25;
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject( obj );
    let center = new THREE.Vector3();
    let size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);
    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = camera.fov * ( Math.PI / 180 );
    let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );
    cameraZ *= offset; // zoom out a little so that objects don't fill the screen
    camera.position.z = cameraZ;
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();
    if ( controls ) {
      // set camera to rotate around center of loaded object
      controls.target = center;
      // prevent camera from zooming out far enough to create far plane cutoff
      controls.maxDistance = cameraToFarEdge * 2;
      controls.saveState();
    } else {
      camera.lookAt( center )
    }
  }
  
  add_axes_helper(): void {
    const axesHelper = new THREE.AxesHelper(400);
    this.scene.add(axesHelper);
  }

  add_grid_helper(size: number = 30): void {
    const divisions = size;
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
  }
  
  add_default_box(): void {
   if (this.side === ViewportSide.right){
     let geometry = new THREE.TetrahedronGeometry(1, 2);
     let material = new THREE.MeshPhongMaterial({color: 'blue'});
     material.flatShading = true;
     const mesh = new THREE.Mesh(geometry, material);
     this.scene.add(mesh);
   }else{
     let geometry = new THREE.BoxGeometry(1, 1, 1);
     let material = new THREE.MeshPhongMaterial({color: 'red'});
     const mesh = new THREE.Mesh(geometry, material);
     this.scene.add(mesh);

   }
  }

}

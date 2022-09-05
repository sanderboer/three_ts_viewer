import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CameraType, ViewportSide } from "./enums"
import { SceneController } from "./scene-controller"

export class WebViewer {
  // private scene: THREE.Scene;
  // private controls: OrbitControls;
  private renderer: THREE.WebGLRenderer;
  private webGlCanvas: HTMLElement;
  private webGlCanvasDivId: string;
  // private persp_camera: THREE.PerspectiveCamera;
  // private ortho_camera: THREE.OrthographicCamera;

  private scenes: SceneController[] = [];
  
  constructor(webGlCanvasDivId: string = "WebGLCanvas") {
    this.webGlCanvasDivId = webGlCanvasDivId;
  }

  dispose(): void {
    if (this.webGlCanvas) {
      this.webGlCanvas.removeChild(this.renderer.domElement);
      this.webGlCanvas = null;
    }
    window.removeEventListener("resize", this.onWindowResize);
  }
  
  init(){
    const webGlCanvas: HTMLElement = this.get_webgl_canvas();
    this.add_renderer();
    this.scenes.push(new SceneController(this, ViewportSide.left));
    this.scenes.push(new SceneController(this, ViewportSide.right));
    window.addEventListener("resize", this.onWindowResize, false);
    this.animate_scene();
  }

  private add_renderer(): void {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) {
      // your browser/OS/drivers do not support WebGL2
      this.renderer = new THREE.WebGL1Renderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } else {
      // webgl2 works!
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    }
    const webGlCanvas: HTMLElement = this.get_webgl_canvas();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(webGlCanvas.clientWidth, webGlCanvas.clientHeight, false);
    this.renderer.sortObjects = true;
    this.renderer.localClippingEnabled = true;
    webGlCanvas.appendChild(this.renderer.domElement);
  }

  get_renderer(): THREE.WebGLRenderer{
    return this.renderer;
  }
  
  get_webgl_canvas(): HTMLElement{
    if (!this.webGlCanvas) {
      this.webGlCanvas = document.getElementById(this.webGlCanvasDivId);
      if (!this.webGlCanvas) {
        return null;
      }
      // disabled removing all childnodes from webGLCanvase element for overlay purposes.
      if (this.webGlCanvas.children && this.webGlCanvas.children.length > 0) {
        while (this.webGlCanvas.hasChildNodes()) {
          this.webGlCanvas.removeChild(this.webGlCanvas.lastChild);
        }
      }
    }
    return this.webGlCanvas;
  }

  onWindowResize = (): void => {
    const webGlCanvas: HTMLElement = this.get_webgl_canvas();
    // Door de renderer eerst op 0 te zetten, kan de webGlCanvas Element een nieuwe width en height krijgen bij gebruik in flexbox, table o.i.d.
    this.renderer.setSize(0, 0, false);
    for (const scene of this.scenes){
      scene.update();
    }
    this.renderer.setSize(webGlCanvas.clientWidth, webGlCanvas.clientHeight, false);
  };


  private animate_scene = () => {
    if (this.scenes.length > 1){
      this.renderer.setScissorTest(false);
      this.renderer.clear(true, true);
      this.renderer.setScissorTest(true);
    }
    for (const scene of this.scenes){
      scene.render();
    //this.renderer.render(scene.scene, scene.camera)
    }
    requestAnimationFrame(this.animate_scene);
  }

}


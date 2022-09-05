import * as THREE from 'three';
export declare class WebViewer {
    private renderer;
    private webGlCanvas;
    private webGlCanvasDivId;
    private scenes;
    constructor(webGlCanvasDivId?: string);
    dispose(): void;
    init(): void;
    private add_renderer;
    get_renderer(): THREE.WebGLRenderer;
    get_webgl_canvas(): HTMLElement;
    onWindowResize: () => void;
    private animate_scene;
}

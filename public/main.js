var web_viewer = null;
var my_headers = new Headers();
my_headers.append("pragma", "no-cache");
my_headers.append("cache-control", "no-cache");


function initialize_webviewer() {
  web_viewer = new MaucWebViewer.WebViewer("WebGLCanvas");
  web_viewer.init();
}

import Ember from 'ember';
//import THREE from 'three';

export default Ember.Component.extend({
  threeScene: {},
  renderScene: function() {
    /*
    this.threeScene = {};
    this.threeScene.scene = new THREE.Scene();
    this.threeScene.camera = new THREE.PerspectiveCamera( 75, this.element.clientWidth / this.element.clientHeight, 0.1, 1000 );

    this.threeScene.renderer = new THREE.WebGLRenderer();
    this.threeScene.renderer.setSize( this.element.clientWidth, this.element.clientHeight );
    this.element.appendChild( this.threeScene.renderer.domElement );

    this.threeScene.geometry = new THREE.BoxGeometry( 1, 1, 1 );
    this.threeScene.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    this.threeScene.cube = new THREE.Mesh( this.threeScene.geometry, this.threeScene.material );
    this.threeScene.scene.add( this.threeScene.cube );

    this.threeScene.camera.position.z = 5;

    function render(context) {
      requestAnimationFrame( render );
      context.threeScene.renderer.render( context.threeScene.scene, context.threeScene.camera );
    }
    render(this);
    */
  },
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, this.renderScene);
  },
});

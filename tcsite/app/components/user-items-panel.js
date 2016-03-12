import Ember from 'ember';

export default Ember.Component.extend({
  onRendered: Ember.on('init', function() {
    console.log();
    var elem = Ember.$('#tcs-main-panel');
    //debugger;
    //console.log(window.mezr.width(elem));
  })
});

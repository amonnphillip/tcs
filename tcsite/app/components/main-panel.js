import Ember from 'ember';
import Rest from 'rest';

export default Ember.Component.extend({
  displayItems: [],
  onRendered: Ember.on('init', function() {
    this.set('displayItems', []);
    this.get('displayItems').push('item1');
    this.get('displayItems').push('item2');
    this.get('displayItems').push('item3');

    Rest.get('')
  })
});

import { moduleFor, test } from 'ember-qunit';
"use strict";

moduleFor('service:http', 'Unit | Service | http', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('test get success case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.get('http://localhost:4201/api/voice').then(function() {
    assert.ok(true, 'get request successful');
    done();
  }.bind(this)).catch(function() {
    assert.ok(false, 'get request failed');
    done();
  }.bind(this));
});

test('test get expected failure case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.get('http://localhost:4201/fdsfsdfsfsfsfsfsdf').then(function() {
    assert.ok(false, 'get request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'get request failed');
    done();
  }.bind(this));
});

test('test get cancel case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  var canceller = {};
  service.get('http://localhost:4201/api/voice', canceller).then(function() {
    assert.ok(false, 'get request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'get request failed');
    done();
  }.bind(this));
  canceller.cancel();
});


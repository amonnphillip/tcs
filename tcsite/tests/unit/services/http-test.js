import { moduleFor, test } from 'ember-qunit';

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
  service.get('http://localhost:4202/route').then(function(res) {
    assert.ok(true, 'get request successful');
    assert.ok(res.response === '{"param":"OK"}', 'get request successful');
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
  service.get('http://localhost:4201/route', canceller).then(function() {
    assert.ok(false, 'get request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'get request failed');
    done();
  }.bind(this));
  canceller.cancel();
});


test('test post success case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.post('http://localhost:4202/route', {data: 'post data'}).then(function(res) {
    assert.ok(true, 'post request successful');
    assert.ok(res.response === '{"data":"post data"}', 'post request successful');
    done();
  }.bind(this)).catch(function() {
    assert.ok(false, 'post request failed');
    done();
  }.bind(this));
});

test('test post error case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.post('http://localhost:4202/fdsfsdfsfsfsfsfsdf', {data: 'post data'}).then(function(res) {
    assert.ok(false, 'post request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'post request failed');
    done();
  }.bind(this))
});

test('test post cancel case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  var canceller = {};
  service.post('http://localhost:4201/route', {data: 'put data'}, canceller).then(function() {
    assert.ok(false, 'post request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'post request failed');
    done();
  }.bind(this));
  canceller.cancel();
});


test('test put success case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.put('http://localhost:4202/route', {data: 'put data'}).then(function(res) {
    assert.ok(true, 'put request successful');
    assert.ok(res.response === '{"data":"put data"}', 'put request successful');
    done();
  }.bind(this)).catch(function() {
    assert.ok(false, 'put request failed');
    done();
  }.bind(this));
});

test('test put error case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.put('http://localhost:4202/fdsfsdfsfsfsfsfsdf', {data: 'put data'}).then(function(res) {
    assert.ok(false, 'put request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'put request failed');
    done();
  }.bind(this))
});

test('test put cancel case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  var canceller = {};
  service.put('http://localhost:4201/route', {data: 'put data'}, canceller).then(function() {
    assert.ok(false, 'put request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'put request failed');
    done();
  }.bind(this));
  canceller.cancel();
});


test('test del success case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.del('http://localhost:4202/route').then(function(res) {
    assert.ok(true, 'del request successful');
    done();
  }.bind(this)).catch(function() {
    assert.ok(false, 'put request failed');
    done();
  }.bind(this));
});

test('test del error case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.del('http://localhost:4202/fdsfsdfsfsfsfsfsdf').then(function(res) {
    assert.ok(false, 'del request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'del request failed');
    done();
  }.bind(this))
});

test('test del cancel case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  var canceller = {};
  service.del('http://localhost:4201/route', canceller).then(function() {
    assert.ok(false, 'del request was successful, but was expected to fail');
    done();
  }.bind(this)).catch(function() {
    assert.ok(true, 'del request failed');
    done();
  }.bind(this));
  canceller.cancel();
});


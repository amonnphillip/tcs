import { moduleFor, test } from 'ember-qunit';

moduleFor('service:rest', 'Unit | Service | rest', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});
/*
test('test login success case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.login('admin', 'admin', {}).then(function(res) {
    assert.ok(true, 'login request successful');
    assert.ok(service.hasJWT(), 'get request successful');
    done();
  }.bind(this)).catch(function() {
    assert.ok(false, 'login request failed');
    done();
  }.bind(this));
});
*/
test('test login user scopes case', function(assert) {
  var done = assert.async();
  let service = this.subject();
  assert.ok(service);
  service.login('admin', 'admin', {}).then(function() {
    service.scopeCheck({}).then(function (res) {
      assert.ok(true, 'scope request successful');
      done();
    }.bind(this)).catch(function (e) {
      assert.ok(false, 'scope request failed');
      done();
    }.bind(this));
  }.bind(this)).catch(function(e) {
    assert.ok(false, 'login for scope request failed');
    done();
  }.bind(this));
});



var tape = require('tape')
var nanobus = require('./')

tape('nanobus', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(7)
    var bus = nanobus()
    t.throws(bus.emit.bind(bus), /string/)
    t.throws(bus.on.bind(bus), /string/)
    t.throws(bus.on.bind(bus, 'foo'), /function/)
    t.throws(bus.once.bind(bus), /string/)
    t.throws(bus.once.bind(bus, 'foo'), /function/)
    t.throws(bus.removeListener.bind(bus), /string/)
    t.throws(bus.removeListener.bind(bus, 'foo'), /function/)
  })

  t.test('should emit messages', function (t) {
    t.plan(2)
    var bus = nanobus()
    var obj = { bin: 'baz' }
    bus.on('foo:bar', function (data) {
      t.equal(data, obj, 'data was same')
    })

    bus.emit('foo:bar', obj)

    bus.on('beep:boop', function (data) {
      t.equal(data, undefined)
    })

    bus.emit('beep:boop')
  })

  t.test('should emit messages once', function (t) {
    t.plan(1)
    var bus = nanobus()
    bus.once('foo:bar', function (data) {
      t.pass('called')
    })

    bus.emit('foo:bar')
    bus.emit('foo:bar')
  })

  t.test('should be able to remove listeners', function (t) {
    t.plan(3)
    var bus = nanobus()
    bus.on('foo:bar', goodHandler)
    bus.on('foo:bar', badHandler)
    bus.removeListener('foo:bar', badHandler)
    bus.emit('foo:bar')

    bus.once('foo:bar', goodHandler)
    bus.removeListener('foo:bar', onceHandler)
    bus.emit('foo:bar')

    function goodHandler (data) {
      t.pass('called')
    }

    function onceHandler (data) {
      t.pass('called')
    }

    function badHandler (data) {
      t.fail('oh no!')
    }
  })

  t.test('should be able to remove all listeners', function (t) {
    t.plan(1)
    var bus = nanobus()
    var i = 0

    bus.on('foo:bar', handler)
    bus.on('bin:baz', handler)
    bus.removeAllListeners()
    bus.emit('foo:bar')
    bus.emit('bin:baz')

    t.equal(i, 0, 'no events called')

    function handler (data) {
      i++
    }
  })

  t.test('should be able to remove all listeners for an event', function (t) {
    t.plan(1)
    var bus = nanobus()
    var i = 0

    bus.on('foo:bar', handler)
    bus.on('bin:baz', handler)
    bus.removeAllListeners('bin:baz')
    bus.emit('foo:bar')
    bus.emit('bin:baz')

    t.equal(i, 1, '1 event called')

    function handler (data) {
      i++
    }
  })

  t.test('should be able to have * listeners', function (t) {
    t.plan(11)
    var bus = nanobus()
    var i = 0

    bus.on('foo:bar', handler)
    bus.on('bin:baz', handler)
    bus.on('*', handler)

    bus.emit('foo:bar')
    t.equal(i, 2, 'count 2')

    bus.emit('bin:baz')
    t.equal(i, 4, 'count 4')

    bus.removeAllListeners('bin:baz')
    bus.emit('bin:baz')
    t.equal(i, 5, 'count 5')

    bus.removeListener('*', handler)
    bus.emit('foo:bar')
    t.equal(i, 6, 'count 6')

    bus.on('*', handler)
    bus.emit('foo:bar')
    t.equal(i, 8, 'count 8')

    bus.removeAllListeners('*')
    bus.emit('foo:bar')
    t.equal(i, 9, 'count 9')

    bus.on('*', handler)
    bus.emit('foo:bar')
    t.equal(i, 11, 'count 11')

    bus.removeAllListeners()
    t.equal(i, 11, 'count 11')

    bus.once('*', handler)
    bus.emit('foo:bar')
    t.equal(i, 12, 'count 12')
    bus.emit('foo:bar')
    t.equal(i, 12, 'count 12')

    bus.removeAllListeners()
    t.equal(i, 12, 'count 12')

    function handler (data) {
      i++
    }
  })
})

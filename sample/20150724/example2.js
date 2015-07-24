var assert = require('assert');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/example2');

var options = { discriminatorKey: 'kind' };

var eventSchema = new mongoose.Schema(
  {
    // The time the event took place
    time: {
      type: Date,
      default: Date.now
    }
  },
  options);
var Event = mongoose.model('Event', eventSchema);

var clickedEventSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  options);
var ClickedLinkEvent = Event.discriminator('ClickedLink', clickedEventSchema);

var purchasedSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId }
  },
  options);
var PurchasedEvent = Event.discriminator('Purchased', purchasedSchema);

var e = new ClickedLinkEvent({
  from: 'http://www.google.com'
});

console.log(e.kind); // Prints 'ClickedLink'

var error = e.validateSync();
assert.ok(error);
// Prints ['to'] because no 'to' link specified
console.log(Object.keys(error.errors));

setupData();

function setupData() {
  ClickedLinkEvent.create({ from: 'abc', to: '123' }, function(err) {
    assert.ifError(err);
    var product = { product: '00000000000000000000000c' };
    PurchasedEvent.create(product, function(err) {
      assert.ifError(err);

      Event.find({}, function(error, events) {
        assert.ifError(error);
        assert.equal(events.length, 2);
        assert.equal(events[0].kind, 'ClickedLink');
        assert.equal(events[1].kind, 'Purchased');

        // `from` field gets pulled in too
        assert.equal(events[0].from, 'abc');

        example2();
      });
    });
  });
}

function example2() {
  ClickedLinkEvent.find({}, function(error, events) {
    assert.ifError(error);
    assert.equal(events.length, 1);
    assert.equal(events[0].kind, 'ClickedLink');

    assert.equal(events[0].from, 'abc');

    process.exit(0);
  });
}

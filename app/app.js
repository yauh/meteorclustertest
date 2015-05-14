ConfigCollection = new Mongo.Collection('config');
serviceName = '';
BackendService = null;

if (Meteor.isClient) {
  Session.setDefault('result', null);
  Meteor.subscribe('config');

  Template.registerHelper('config', function () {
    // optimize using http://underscorejs.org/#pairs
    return ConfigCollection.findOne();
  });

  Template.registerHelper('result', function () {
    return Session.get('result');
  });

  Template.callMethod.events({
    'click .hello': function (evt, tpl) {
      Meteor.call('helloServer', function (err, res) {
        if (err) {
          console.log('error: ' + err);
          Session.set('result', {
            error: err
          });
        } else {
          console.log('result: ' + res);
          Session.set('result', res);
          return res;
        }
      });
    }
  });

};

if (Meteor.isServer) {
  Meteor.startup(function () {
    serviceName = process.env['CLUSTER_SERVICE'];
    hostname = Npm.require('os').hostname();
    port = process.env['PORT'];
    var environmentConfig = {
      CLUSTER_BALANCER_URL: process.env['CLUSTER_BALANCER_URL'],
      CLUSTER_DISCOVERY_URL: process.env['CLUSTER_DISCOVERY_URL'],
      CLUSTER_ENDPOINT_URL: process.env['CLUSTER_ENDPOINT_URL'],
      CLUSTER_PUBLIC_SERVICES: process.env['CLUSTER_PUBLIC_SERVICES'],
      CLUSTER_SELF_WEIGHT: process.env['CLUSTER_SELF_WEIGHT'],
      CLUSTER_SERVICE: process.env['CLUSTER_SERVICE'],
      CLUSTER_UI_SERVICE: process.env['CLUSTER_UI_SERVICE'],
      HOSTNAME: Npm.require('os').hostname(),
      MONGO_URL: process.env['MONGO_URL'],
      PORT: process.env['PORT'],
      ROOT_URL: process.env['ROOT_URL']
    };
    var id = hostname + ':' + port;
    ConfigCollection.upsert(id, environmentConfig);

    if (serviceName != 'backend') {
      BackendService = Cluster.discoverConnection('backend');
    }

    // PUBLICATIONS
    Meteor.publish('config', function () {
      return ConfigCollection.find({
        _id: id
      });
    });

  });

  // METHODS
  Meteor.methods({
    'helloServer': function () {
      var id = hostname + ':' + port;
      console.log('Method helloServer on ' + id + ' (' + process.env['CLUSTER_SERVICE'] + ')');

      if (serviceName === 'backend') {
        // started as backend service
        var config = ConfigCollection.findOne({
          _id: id
        });
        console.log(id + ' returning ', config);
        return config;
      }

      // started as web service
      return BackendService.call('helloServer');
    }
  });
}

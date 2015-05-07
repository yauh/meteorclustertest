ConfigCollection = new Mongo.Collection('config');
serviceName = '';
BackendService = null;

if (Meteor.isClient) {
  Meteor.subscribe('config');
  Template.clusterInfo.helpers({
    config: function () {
      return ConfigCollection.findOne();
    }
  });

  Template.callMethod.helpers({
    result: function () {
      return Session.get('result');
    }
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

    ConfigCollection.upsert(hostname, environmentConfig);

    if (serviceName != 'backend') {
      BackendService = Cluster.discoverConnection('backend');
    }

    // PUBLICATIONS
    Meteor.publish('config', function () {
      return ConfigCollection.find({
        _id: hostname
      });
    });

  });

  // METHODS
  Meteor.methods({
    'helloServer': function () {
      console.log('Method helloServer on ' + hostname + ' (' + process.env['CLUSTER_SERVICE'] + ')');

      if (serviceName === 'backend') {
        // started as backend service
        return 'This comes from the backend service at ' + hostname;
      }

      // started as web service
      return BackendService.call('helloServer');
    }
  });
}
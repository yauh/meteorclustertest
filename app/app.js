ConfigCollection = new Mongo.Collection('config');
serviceName = '';
FooService = null;


if (Meteor.isClient) {
  Meteor.subscribe("config");
  Template.clusterinfo.helpers({
    config: function () {
      console.log(ConfigCollection.findOne());
      return ConfigCollection.findOne();
    }
  });

  Template.clusterFunctions.events({
    'click .say-hi': function(evt, tpl) {
      Meteor.call('sayHi', function(err, res){
         console.log('result: ' + res);
      });
    }
  })

}

if (Meteor.isServer) {

  Meteor.methods({
    'sayHi': function(){
      console.log(process.env['CLUSTER_SERVICE'] + ': sayHi');

      if(serviceName == 'foo'){
        // started as foo service
        return 'Hi';
      }

      // started as web service
      return FooService.call('sayHi');
    }
  });

  Meteor.startup(function () {

    serviceName = process.env['CLUSTER_SERVICE'];

    if(serviceName != 'foo'){
      FooService = Cluster.discoverConnection('foo');
    }

    // code to run on server at startup
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
    if (ConfigCollection.findOne()) {
      var id = Npm.require('os').hostname();
    }

    //console.log('current config (' + id + '):', environmentConfig);
    ConfigCollection.upsert(id, environmentConfig);

    Meteor.publish('config', function () {
      return ConfigCollection.find({
        _id: id
      });
    });

    //Cluster.connect(process.env['CLUSTER_DISCOVERY_URL']);
  });
}
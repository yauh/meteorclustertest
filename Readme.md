Meteor Cluster Test
===================

Sample application(s) to test [meteor
cluster](https://github.com/meteorhacks/cluster)

MongoDB setup
-------------

We'll need three databases, one for communication between the nodes
(`cluster`) and two for the app (`data` and `oplog`).

Create the MongoDB users accordingly.

    db.createUser({
      "user": "clusteruser",
      "pwd": "password",
      "roles": [{
        role: "readWrite",
        db: "cluster"
      }]
    });

    db.createUser({
      "user": "datauser",
      "pwd": "password",
      "roles": [{
        role: "readWrite",
        db: "data"
      }]
    });


    db.createUser({
      user: 'oplog',
      pwd: 'password',
      roles: [{  
        role: "read",
        db: "local"
      }]
    });

App servers
-----------

Add the `meteorhacks:cluster` package to the application.

    meteor add meteorhacks:cluster

In the scenario we'll use two app servers.

Balancers
---------

In order to make an instance a balancer set the `CLUSTER_BALANCER_URL`
environment variable.

    export CLUSTER_BALANCER_URL=https://subdomain.domainname.com

Are all balancers also acting as app servers?

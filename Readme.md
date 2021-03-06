# Meteor Cluster Test
Sample application(s) to test [meteor cluster](https://github.com/meteorhacks/cluster)

## Prerequisites and architecture
Using this cluster test assumes a setup of
- A MongoDB server
- 2 Ubuntu hosts

![Cluster setup architecture](doc/architecture.png)

Both Meteor servers can be accessed.

## MongoDB setup
We'll need three databases, one for communication between the nodes (`cluster`) and two for the app (`data` and `oplog`).

Create the MongoDB users accordingly.

```
use cluster;
db.createUser({
  "user": "clusteruser",
  "pwd": "password",
  "roles": [{
    role: "readWrite",
    db: "cluster"
  }]
});

use data;
db.createUser({
  "user": "datauser",
  "pwd": "password",
  "roles": [{
    role: "readWrite",
    db: "data"
  }]
});

use admin;
db.createUser({
  user: 'oplog',
  pwd: 'password',
  roles: [{  
    role: "read",
    db: "local"
  }]
});
```

## App servers
The `meteorhacks:cluster` package adds cluster abilities to the application.

TODO: Put more info here

## Balancers
TODO: Instances that are only acting as balancers, to distribute traffic between all app servers.

In order to make an instance a balancer set the `CLUSTER_BALANCER_URL` environment variable.

```
export CLUSTER_BALANCER_URL=https://subdomain.domainname.com
```

Need a DNS entry per Balancer instance

## Running a simple cluster
Adjust all environment variables in the `mup.json` file according to your environment. Then issue the commands

```
mup setup
```

and

```
mup deploy
```

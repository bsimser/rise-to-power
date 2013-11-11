# Rise to Power! Backend Design

## Objective

Implement the server-side portion of the v0 RTP design.

## Background

Rise to Power! is a browser-based MMO with a Civilization flavor. Players vie for power by controlling the most land and vassals. Here we document the server-side design of the Rise to Power! system.

## Overview

There are two main server types in this design: frontends and backends. Frontends authenticate users, serve them the UI bundle, and offload them to an appropriate backend. Backends are mostly concerned with handling mutations of game state, and verifying orders entered through the client.

In order for frontends to know how to dispatch the client to the right backend, especially in the presence of frontend and backend failure, we also run an etcd cluster, which holds registrations of all running servers. Frontends are resilient by default due to their light, stateless nature.

Backends are responsible for storing the game state for their assigned shard as well, which is accomplished through a custom append-only style datastore, implemented via Raft. To provide for resilience to failure, the raft master backend also distributes each shard’s data to some number (three by default) backends, where one is the primary server of that data, through which all mutations occur, and the others are slave nodes that serve merely as backups should the primary server fail.

In addition to their normal responsibilities in the raft protocol, the backend node that is the raft master is in charge of dispatching work, in the form of game state shards, signalling end of turn, and instructing other backend nodes to store copies of each other’s data.

## Infrastructure

- [JSONRPC](http://json-rpc.org) and [websockets](http://www.websocket.org/aboutwebsocket.html) are used for client communication.
- [Etcd](http://coreos.com/using-coreos/etcd/) is for global state storage and master election.

## Detailed Design

(**NOTE**: Where v(-1) is used in this document, it refers to a non-productionized, but otherwise feature-complete version of the v0 code.)

For v0 of this project, we’re interested in satisfying the following requirements:

- RTP communicates over standard web protocols in order to serve users a web page (json transports/ajax/websocket may all be employed).
- RTP authenticates players.
- RTP persists user order list modifications.
- RTP persists the previous turn game state.
- RTP disallows modification to Order lists for a turn after that turn’s Turn Resolution Phase has started.
- RTP presents Administrators with a privileged view of the game state and the operations of the server which also supports otherwise-illegal, but only-ever-sane modifications to the game state.

Obviously, these basic requirements embody a list of other implied requirements. To satisfy both set of requirements, we propose the following design:

### Client Flow

1. Browser hits ‘/’ on the game subdomain of rise-to-power.com. This hits a frontend server.
2. Frontend server responds with an HTML page that includes the javascript and resources to bootstrap a rise-to-power client.
3. Client code, after loading, sends a GET request to the /_api/backendAddress endpoint.
4. If the user is logged in, the frontend server sends a response containing the address of the backend server to which the client should connect as a plain string (skip to step 7). Otherwise, the server sends a 403 status code to indicate that the client needs to log in.
5. The client requests credentials from the user, and sends them as a JSON object with ‘Username’ and ‘Password’ fields in the body of a request to the /_api/login endpoint.
6. If the credentials are correct, the frontend sets an auth cookie in an otherwise empty response to the client (go to step 3). Otherwise, the frontend sends a 403 status code to the client.
7. The client connects to the /_api/connect endpoint on the indicated backend server via websockets (NOTE: this will eventually change to using socket.io, but Go support needs to be updated/written first, and so is unsuitable for v0).
8. If the backend is the incorrect backend for the connected client, it sends a ClientCommand object of type REDIRECT with the address of the correct server in the payload (go to step 7). Otherwise, it sends a ClientCommand object of type GAME_STATE, with the payload as specified in the data model section below.
9. As the user enters orders, the client sends ClientCommand objects of type VALIDATE_ORDER as described in the data model section
10. The server responds with a ClientAck object as appropriate to indicate whether the suggested order is valid.
11. The client sends a ClientCommand of type ORDER when the user sets an order in the UI, with contents as described in the data model section.
12. The server sends a ClientAck object when that order has been persisted to permanent storage and replicated accordingly.
13. When an end of turn is signaled to the backend server, it sends an END_OF_TURN_START ClientCommand to the client. When the end of turn processing is done, it sends END_OF_TURN_STOP, which includes the new state of the world. The structure of all of these messages is included in the data model section of this document.

### Frontend Servers

The frontend serves mostly as a blind relayer of information from the rest of the system. It 'knows' (in v(-1) via flags) where the content it should serve as the client is to be read from, and it 'knows' (in v(-1), also flags) where the backend nodes are, so that it can determine where to send the client. It also is assumed to know how to authenticate users in v(-1).

### Backend Servers

Backend servers exist in two different modes: 'master' and 'worker'.

#### Master Node

The system ensures that there is only one master backend node at any given time by performing master election with the etcd instance.

When master, the node is responsible for ensuring that all state is replicated the correct number of times (default: 3), and
storing the information about replication in the etcd state, which is where the other servers pick it up. As part of this, it also tracks server outages, and updates the information in the etcd state as applicable.

In addition, it is responsible for deciding when end-of-turn happens, and putting that machinery in motion. It is also needed to perform some of the work in that state. At the end of each turn, after all processing has occurred, the master distributes rule and code updates to all backends. This may involve reloading backends, and clients connections to backends that have not yet upgraded are rejected to prevent problems with inconsistent rule enforcement.

Master nodes also do the work of a worker node.

#### Worker Node

The worker node has to respond to client requests and calculate end-of-turn:

##### Client Requests

Backends expose a websocket on the /_api/connect endpoint, which is the sole channel for client requests. They respond to three kinds of client requests (specific data format is contained in the data model section):

- *STATE_REFRESH*: The backend sends back a full dump of the current game state, similar to what happens when a client first initiates a connection.
- *VALIDATE_ORDER*: The backend verifies a given order according to the current rules. **NOTE**: This is a still-questionable design decision.
- *ORDER*: The backend verifies the validity of the order, commits it to permanent storage, ensures it has been committed to the replicas, then returns back to the user.

##### Turn End Calculation

When the master signals that the end of turn has occurred, all backend servers start participating in the end of turn calculation. To do this, the following steps are taken by each backend independently:

1. Farms produce food.
1. Extractors produce resources.
1. Refineries refine.
1. Barracks train.

Then, all backends that contain information about a given player communicate to perform:

5. Troop keep-up,
6. Emissary messages
7. Unit movement.

Each backend then calculates:

8. Combat outcomes
9. Municipality ownership

Then finally, the backends cooperatively communicate again to perform:

10. Power level resolution
11. Player relationship changes
12. Player resource summation

### Data Model

The following data is serialized to JSON as specified in the [Go documentation](http://golang.org/pkg/encoding/json/#Marshal), except that pointers to objects are serialized as though they were a string field containing that object's 'Id' field.

#### ClientCommand

```go
type RedirectClientCommand struct {
  Type string  // Always "REDIRECT"
  Url  string
}

type GameStateClientCommand struct {
  Type    string // Always "GAME_STATE"
  Map     []Municipality // All Municipalities the player owns, or has units in.
  Squares []Square // All squares in all Municipalities contained above.
  Units   []Unit
  Player  Player
}

type ValidateOrderClientCommand struct {
  Type  string // Always "VALIDATE_ORDER"
  Order *Order
}

type OrderClientCommand struct {
  Type  string // Always "ORDER"
  Order *Order
}

type EndOfTurnStartClientCommand struct {
  Type       string // Always "END_OF_TURN_START"
  TurnNumber int
}

type EndOfTurnStopClientCommand struct {
  Type       string // Always "END_OF_TURN_STOP"
  TurnNumber int
  NewState   GameStateClientCommand
}

type StateRefreshClientCommand struct {
  Type string // Always "STATE_REFRESH"
}

type ClientAckClientCommand struct {
  Type    string // Always "CLIENT_ACK"
  OrderId int
}
```

#### Game State

```go
type TitleEnum string

type Player struct {
  Id        string
  Name      string
  Friends   []*Player // List of players with whom we are friends.
  Hostiles  []*Player // List of players with whom we are enemies.
  OwnedLand []*Municipality // List of municipalities that this player has direct control over
  Title     TitleEnum // Enum representing power level
  Liege     *Player // Higher-up Player, null if none
  Vassals   []*Player // List of immediately lower players, empty if none
  Orders    []*Order // List of Order IDs the player has created
}

type Municipality struct {
  Id        string
  X         int // X coordinate of this municipality's origin.
  Y         int // Y coordinate of this municipality's origin.
  Owner     *Player // Player that owns this land, null if unowned
  Conqueror *Player // The Player who has just conquered this municipality, null if owner is non null.
  Appointee *Player // The Player the conqueror of this Municipality has appointed.
}

type Square struct {
  Id                 string
  Terrain            *Terrain // The type of the terrain of this square
  X                  int // X coordinate of the square.
  Y                  int // Y coordinate of the square.
  BuildingProduction *ProductionLevel // The ProductionLevel of a building being built here
  Building           *Building // The building that exists here, null if empty
  Resource           *ResourceBlueprint // A ResourceBlueprint that can be extracted (by an extractor), null if no resource present here.
}

type ResourceQuantity struct {
  Id       string
  Type     *ResourceBlueprint
  Quantity int
}

type ProductionLevel struct {
  Id       string
  Type     *Production // The kind of production that’s happening
  Location *Square // The Square this production is happening on
  Building *Building // The building this production is happening on, null if no building
  Rate     float64 // a double between 0 and 1 denoting the rate at which progress should be made on this production, defaults to 1
  Progress int // integer progress out of 100
  Stalled  bool // boolean, true if the costs of this production aren’t currently met.
}

type Building struct {
  Id               string
  Type             *BuildingBlueprint // A BuildingBlueprint denoting the type of building
  Location         *Square // The Square that this building is built on
  ProductionLevels []ProductionLevel // list of ProductionLevels, one for each Production in the type, that stores the current progress on that Production
  Storage          []ResourceQuantity // a list of the things currently stored in this building
}

type Unit struct {
  Id       string
  Type     *UnitBlueprint
  Owner    *Player
  Location *Square // The Square that this unit is currently in
  Power    int // Integer representing this unit’s current power
  Group    string // A unique identifier for a group of units. All units in a group share this identifier.
}

// Note: Used only as an anonymous member of other structs.
type Order struct {
  Id    string
  Name  string // A UI-friendly name for this order
  Type  string // The name of the type of order this is.
  Order interface{} // One of the order types below.
}

type MovementOrder struct {
  Unit        *Unit // The unit that is moving, or any unit in a group that is moving.
  Destination *Square // The destination Square
  Path        []*Square // a list of Squares denoting the current path that terminates at the destination Square.
}

type BuildBuildingOrder struct {
  Location *Square // The Square the building should be built on
  Building *BuildingBlueprint // The BuildingBlueprint that should be constructed here
}

type CancelBuildingOrder struct {
  Location *Square // The Square the building is being built on
}

type FormGroupOrder struct {
  Units []*Unit // A list of units to form into a group
}

type SplitGroupOrder struct {
  Unit *Unit // Any unit in a group that should be split up.
}

type AdjustProductionRateOrder struct {
  Production *ProductionLevel // The ProductionLevel to adjust
  Rate       float64 // double, the new rate to set the production level to.
}

type FoundCityOrder struct {
  Timestamp    time.Time // The timestamp that this order was received by the server (for ordering purposes).
  Municipality *Municipality // The Municipality that the player is attempting to own.
}

type AppointSubordinateOrder struct {
  Municipality *Municipality // The recently vacated Municipality that the player is attempting to appoint a subordinate to.
  Player       *Player // The subordinate Player.
}

type SetRelationsOrder struct {
  OtherPlayer    *Player // The other Player
  RelationStatus string // The new Relation status
}

type AcceptAppointmentOrder struct {
  Municipality *Municipality // The vacant Municipality whose liege has appointed this player.
}

type RejectAppointmentOrder struct {
  Municipality *Municipality // The vacant Municipality whose liege has appointed this player.
}
```

#### Game Rule Structs

```go
type Terrain struct {
  Name      string // UI name of this terrain
  Image     string // path to the image file for this terrain
  Modifiers []*Modifier // Modifiers that are invoked on units or buildings that are on squares of this kind of terrain.
}

type ResourceBlueprint struct {
  Id    string
  Name  string // UI name of this resource
  Image string // path to the image file for this resource
}

type BuildingBlueprint struct {
  Id               string
  Name             string // UI name of this kind of building
  Image            string // path to the image file for this building
  Production       []*Production // list of Productions, each of which can be produced by this kind of building
  ConstructionCost []ResourceQuantity // required to build this building, null denotes that the building cannot be built
}

type UnitBlueprint struct {
  Id        string
  Name      string // UI name of this kind of Unit
  Image     string // path to the image file for this unit
  MaxPower  int // maximum level of power for this type of unit
  Movement  int // number of squares this unit can move
  Modifiers []*Modifier // list of Modifiers that change this units behavior
}

type Modifier struct {
  Id   string
  Type string // A CamelCase string used to refer to this modifier.
  Name string // A UI-friendly name for the modifier
  // note that the actual execution of this modifier and the rules it changes is probably best expressed in code.
}
```

## Project Information

- Contributors: applmak, jwall, swsnider.
- Code is located at https://code.google.com/p/rise-to-power. See the Hacking on RTP doc for more information.
- The client is written in Javascript, using AngularJS, and the backend(s) are written in Go.

## Latency

The main latency concern is the amount of time the server takes to compute the end of turn. We’d like to keep this well under 5 minutes in general.

It’s also nice to keep the latency of individual order-setting requests low, but the client already needs to provide queueing and retry logic for these, so the latency requirements are not as high as might be feared.

## Scalability

The system scales pretty trivially, we believe. We can independently adjust the number of frontend and backend servers, and the system will automatically adjust to assign them work.

The only tricky part may be the etcd cluster -- we need to do testing to ensure that the cluster can withstand our write/read load.

It is not yet clear (because we have not yet built the servers, let alone conducted load testing of them) how much QPS/server the system can sustain.

## Redundancy & Reliability

If a frontend server is lost, we lose no important state, and as long as we have one frontend server, we’ll be able to serve user requests (though the max sustainable QPS does obviously go down.)

Backend servers are significantly more important, and carry game state that is impossible to reconstruct were all of it to be lost. Therefore, a master (which is elected via the etcd cluster) ensures that some definable number of servers (by default, 3) have any given shard of data at a time.

If a backend server drops out, the master notices, and schedules replication of its data to fill in the gap. User connections to the affected server will be dropped, causing the client to have to query a frontend for a new server to talk to. This will be noticeable to the user only as a lengthing of the queue of un-committed orders.
If the master server drops out, the master election protocol will elect a new one quite quickly, which can start managing the cluster immediately.

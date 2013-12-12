# Rise to Power! Serialization Protocol

This document describes the serialization protocol between the server and the client. Note that this is not a general-purpose serialization protocol, but specific to the game objects of RTP.

## Serialization

A game object that doesn't refer to any other objects (like Terrain objects) is serialized using a normal JSON stringify. This is the simplest case, as JSON can take care of all primitive datatypes like numbers, strings, arrays, dictionaries, etc.

When an object refers to another object, this reference is always implicitly typed. When a Player mentions his liege, the type of that field is already known to be Player, and in order to reduce byte cost, this information isn't serialized in the resulting string. Instead, the minimum amount of information required for a client to reconstruct this pointer in the context of the local game state is serialized. The liege, in thise case, will be the ID of the player's liege, which is of primitive type and can be trivially JSONified. Also, the backend is responsible for ensuring that the player's view on his liege (as a serialized Player object) is sent down with any update so that the client can deserialize all of the necessary objects.

## Deserialization

The client deserilizes game objects in a two-phase operation. The first phase runs the strings through JSON.parse, and the constructs half-deserialized objects for every typed object mentioned in the dictionary. Because the types of these keys are implicit and always well-formed in some container class, the container always knows how to deserialize its contents. For instance, GameState knows how to take its Array of deserialized player Objects and convert that to an Array of Player instances (by mapping it through Player.deserialize).

Once this first phase is complete, the second, fix-up phase connects the various half-deserialized objects together. A half-deserialized Player's liege is just the string ID of that player at this point. After finishDeserialize, which is passed the whole game state, these references to other game objects are restored. The game can then be played.


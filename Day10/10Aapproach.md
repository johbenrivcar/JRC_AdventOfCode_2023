# Approach

Directions are indicated by compass bearing, i.e. N, S, E and W, with the corners being NW, NE, SE and SW.

To be able to the pipes from one cell to another requires this knowledge:

The tile we have reached:

* The arrival IN direction, in the direction of travel, i.e. from the point of view of the tile that we came from.
* The shape of the pipe in the cell
    * (If the shape does not connect to the IN direction, this is an error).
* ... From which we get the departure OUT direction
    * From which we derive the row and column increments taking us to the next cell.

There are six pipe types

    J|L
    -+-
    7|F

1. Straight up and down |, permitted moves are N>N and S>S
2. Left to Top J, permitted moves are E>N and S>W
3. Left to Bottom 7, permitted moves are E>S and N>W
4. Straight across -, permitted moves are E>E and W>W
5. Right to Top L, permitted moves are W>N and S>E
6. Right to Bottom F, permitted moves are N>E and W>S

The start not does not have a pipe shape, but this is implicit from the pipes in the surrounding four
tiles in the N S E and W directions.

As the start tile connects to two other tiles 
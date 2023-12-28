# Approach
Defining a way of following the tracks from one cell to another requires this knowledge:

The cell we have reached:

* The arrival IN direction
* The shape of the char in the cell
    * If the shape does not connect to the IN direction, this is an error.
* From which we get the departure OUT direction
    * From which we derive the row and column increments taking us to the next cell.
    * AND the new arrival IN direction for the next cell

There are six pipe types

    /|\
    -+-
    \|/

1. Straight up and down |, permitted moves are T>B and B>T
2. Left to Top J, permitted moves are L>T and T>L
3. Left to Bottom 7, permitted moves are L>B and B>L
4. Straight across -, permitted moves are L>R and R>L
5. Right to Top L, permitted moves are R>T and T>R
6. Right to Bottom F, permitted moves are R>B and B>R

Classes

Node - a position in the grid containing or not containing a Pipe. It has 4 port that allow connections to other nodes, N, E, S and W. The pipe joins two of
these ports.

Pipe - a connection inside a Node between two Ports

Conx - a connection between the Ports of two nodes. The connection can be only between E and W or between N and S. A valid connection 
can only exist between two ports that connect to Pipes.

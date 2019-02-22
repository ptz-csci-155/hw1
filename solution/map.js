function map_point(P, Q, A, B, X) {
    /* Assumes that A and B are of the same type. */
    var alpha;
    if (P.length && Q.length && X.length &&
	P.length == Q.length && P.length == X.length) {
	// P, Q, and X are vectors of the same type - alpha is the ratio vector
	// lengths.
	var PX = length(subtract(X,P));
	var PQ = length(subtract(Q,P));
	alpha = PX / PQ;
	return mix(A, B, alpha);
    }
    else if (typeof P == "number" && typeof Q == "number" && typeof X == "number") {
	alpha = Math.abs ((P-X) / (P-Q));
    }
    else {
	var message = "the dimensions of P (" + P + ") , Q (" + Q +  "), and X (" +
	    X + ") do not match";
        throw "map_point: "  + message
    }
    if (typeof A == "number" && typeof B == "number") {
	return (1.0-alpha) * A + alpha * B;
    }
    else {
	return mix(A, B, alpha);
    }
}

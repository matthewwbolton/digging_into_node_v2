let stream1; //readable

let stream2; //writeable

let stream3 = stream1.pipe(stream2);

// The pattern in node with streams is that you take a readable stream and pipe it into a writeable stream
// The ".pipe()" method is only available to the readable interface and cannot be called on a writeable stream
// The writeable stream will act on the readable stream piped to it and expose/return a readable stream to read from
// This readable = readable.pipe(writeable) pattern is how node handles all of its data streaming

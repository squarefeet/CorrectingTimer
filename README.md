CorrectingTimer
===============

A self-correcting JS timer. Replacement for setInterval.

##Boring stuff
Timer v.0.8.2 ~ Copyright (c) 2012 Luke Moody, http://github.com/SquareFeet

Released under MIT license.



##Usage

    // As a constructor:
    var myTimer = new Timer(function() {
        // Do stuff here.
    }, 100);
    myTimer.start();

    // As a replacement for setInterval
    var myTimer = setTimer(function(drift) {
        // Do stuff here. drift arg is Number.
    }, 100);


See code comments for a few more useful goodies...


##Pointless Explanation

Since JS timers (setTimeout/setInterval) are useless at adhering to their 
specified duration, this module calculates the positive or negative drift
of a timer and auto-corrects it.

As an example, you write this code, and run it:

    var prev = Date.now();
    setInterval(function() {
        console.log(Date.now() - prev);
        prev = Date.now();
    }, 50);
    
The chances are, what is logged will rarely be `50`, especially if other
operations are going on in the background on the same thread/worker.

Using this module with the following code will yeild different results:

    setTimer(function(drift) {
        console.log(Date.now() - prev, drift);
        prev = Date.now();
    }, 50);
    
What will get logged now will probably still not be `50`. However, lets
assume that it logs 52 the first time round. The timer will then set a 
timeout for the next tick to be 48ms, since the first time round was
delayed by 2ms. 

For safety's sake (should I remove this?) it allows a minimum timeout duration of
10ms.
/**
*   Timer v.0.8.2 ~ Copyright (c) 2012 Luke Moody, http://github.com/SquareFeet
*   Released under MIT license:
*
*    Permission is hereby granted, free of charge, to any person
*    obtaining a copy of this software and associated documentation
*    files (the "Software"), to deal in the Software without
*    restriction, including without limitation the rights to use,
*    copy, modify, merge, publish, distribute, sublicense, and/or sell
*    copies of the Software, and to permit persons to whom the
*    Software is furnished to do so, subject to the following
*    conditions:
*
*    The above copyright notice and this permission notice shall be
*    included in all copies or substantial portions of the Software.
*
*    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
*    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
*    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
*    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
*    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
*    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
*    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
*    OTHER DEALINGS IN THE SOFTWARE.
*
*   --------------------------------------------------------------------------
*
*   Usage
*   -----
*    // As a constructor:
*    var myTimer = new Timer(function() {
*        // Do stuff here.
*    }, 100);
*    
*    // As a replacement for setInterval
*    var myTimer = setTimer(function() {
*        // Do stuff here.
*    }, 100);
*   
*   See code comments for a few more useful goodies...
*    
*
*   Pointless Explanation
*   ---------------------
*   Since JS timers (setTimeout/setInterval) are useless at adhering to their 
*   specified duration, this module calculates the positive or negative drift
*   of a timer and auto-corrects it.
*
*   As an example, you write this code, and run it:
*       var prev = Date.now();
*      setInterval(function() {
*            console.log(Date.now() - prev);
*            prev = Date.now();
*        }, 50);
*        
*   The chances are, what is logged will rarely be `50`, especially if other
*   operations are going on in the background on the same thread/worker.
*
*   Using this module with the following code will yeild different results:
*    
*        setTimer(function(drift) {
*            console.log(Date.now() - prev, drift);
*            prev = Date.now();
*        }, 50);
*        
*   What will get logged now will probably still not be `50`. However, lets
*   assume that it logs 52 the first time round. The timer will then set a 
*   timeout for the next tick to be 48ms, since the first time round was
*   delayed by 2ms. 
*
*   For safety's sake (remove this?) it allows a minimum timeout duration of
*   10ms.
*/
(function(w){
    
    /**
    *   The main constructor function.
    *   @constructor
    *   @param {Function} onTick The tick function.
    *   @param {Number} interval The tick duration.
    *   @returns {Timer} The instance of timer.
    */
    var Timer = function(onTick, interval) {
        this.setInterval(interval);
        this.setOnTick(onTick);
        
        this._timer = null;
        this._active = false;
        
        this._startTime = 0;
    };
    
    
    /**
    *   Start the timer.
    *   The tick function is called with one argument, the drift amount (int).
    *   @returns {Timer} this.
    */
    Timer.prototype.start = function() {
        
        var drift = 0,
            currentTime = 0,
            actual = 0,
            ideal = 0,
            counter = 0,
            that = this,
            now = Date.now;
        
        
        function onTick() {
            
            that._onTick(drift);
            
            ++counter;
            
            ideal = that._interval * counter;
            actual = now() - that._startTime;
            
            drift = actual - ideal;
            
            if(that._active) {
                setTimeout(onTick, that._interval - drift);
            }
        }
        
        that._active = true;
        that._startTime = now();
        that._timer = setTimeout(onTick, that._interval);
        
        return this;
    };
    
    
    /**
    *   Stop the timer.
    *   @returns {Timer} this.
    */
    Timer.prototype.stop = function() {
        this._active = false;
        clearTimeout(this._timer);
        return this;
    };
    
    
    /**
    *   Set the tick duration. Can be called whilst timer is running.
    *   @param {Number} ms The tick duration.
    *   @returns {Timer} this.
    */
    Timer.prototype.setInterval = function(ms) {
        if(isNaN(ms)) {
            throw new Error('Timer.setInterval requires a number');
        }
        else if(ms < 10) {
            ms = 10;
        }
        
        this._interval = ms;
        return this;
    };
    
    /**
    *   Allow for replacement of the tick function, even whilst the timer
    *   is running.
    *   @param {Function} onTick The new tick function to be called on each cycle.
    *   @returns {Timer} this.
    */
    Timer.prototype.setOnTick = function(onTick) {
        this._onTick = onTick;
        return this;
    };
    
    
    
    /**
    *   Allow the `Timer` constructor to be used as a replacement for 
    *   setInterval.
    *   @param {Function} tick The tick function to call every `interval` ms.
    *   @param {Number} interval The tick duration.
    *   @returns {Timer} A new instance of the `Timer` constructor.
    */
    var setTimer = function(tick, interval) {
        var timer = new Timer(tick, interval);
        timer.start();
        return timer;
    };
    
    
    /**
    *   Imitate the clearTimeout method...
    *   @param {Timer} 
    */
    var clearTimer = function(timer) {
        timer.stop();
    };
    
    
    // Expose.    
    w.Timer = Timer;
    w.setTimer = setTimer;


// Replace `window` with wherever you want to attach `Timer` to if you don't
// want it polluting the global scope.
}(window));
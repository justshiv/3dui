/**
 * Created by siobhan on 15/09/14.
 */

//Modified from http://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer

function CountDownTimer(duration, display, granularity) {
  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.running = false;
    this.display = display;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  var start = Date.now(),
      that = this,
      diff, obj;

  (function timer() {
    diff = that.duration - (((Date.now() - start) / 1000) | 0);

    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;

        alert("Your time is up!");
        proceed();

        //return true;
    }

    obj = CountDownTimer.format(that.duration, diff, that.display);
  }());
};

CountDownTimer.prototype.expired = function() {
  return !this.running;
};

CountDownTimer.format = function(duration, secondsLeft, display) {

    if(secondsLeft < duration/4){
        display.style.color = "red";
    }
    else if(secondsLeft < duration/2){
        display.style.color = "orange";
    }
    else{
        display.style.color = "green";
    }

    var minutes = (secondsLeft / 60) | 0;
    var seconds = (secondsLeft % 60) | 0;


    if(minutes < 10){
        minutes = "0" + minutes;
    }

    if (seconds < 10){
        seconds = "0" + seconds;
    }

    display.textContent = minutes + ':' + seconds;
};
var Sequence = require("../lib/sequence");

suite("Sequence", function(){
  test("runs a sequence correctly", function(done){
    var s = new Sequence();
    var ran = {};
    s.do(function(){
      ran.first = true;
    }).after(10, function(){
      ran.second = true;
    }).once("true == true", function(){
      if(ran.first && ran.second)
        done();
      else
        throw Error("first two steps didn't run!");
    }).run();
  });
  test("interrupts once() correctly", function(done){
    var s = new Sequence();
    var ran = false;
    s.once("false == true", function(){
      ran = true;
    }).run();

    s.on("completed", function(interrupted){
      if(ran) throw new Error("condition ran!");
      if(!interrupted) throw new Error("wasn't interrupted!");
      done();
    })

    setTimeout(function(){
      s.interrupt()
    }, 30);
  });
  test("interrupts after() correctly", function(done){
    var s = new Sequence();
    var ran = false;
    s.after(1000, function(){
      ran = true;
    }).run();

    s.on("completed", function(interrupted){
      if(ran) throw new Error("condition ran!");
      if(!interrupted) throw new Error("wasn't interrupted!");
      done();
    })

    setTimeout(function(){
      s.interrupt()
    }, 30);
  });
});
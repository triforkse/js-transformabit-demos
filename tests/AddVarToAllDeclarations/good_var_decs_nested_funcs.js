function foo() {
  var version = 0.1;
  var name = "js-transformabit";
  version = 0.2;
  var authors = "aen, beh";
  var publish = false;
  function bar() {
    var deps = ["foo", "bar"];
    var created = [1,1,2016];
  }
}

function all_good() {
  var verbose = true;
  var output = "./";
  output = "../../";

  function all_good_sub() {
    var lang = "en";
    verbose = false;
    output = "../../../";
  }
}

function none() {
  var capital = "Stockholm";
  var country = "Sweden";
  var population = 2000000;
  var callingCode = null;

  population = 1500000;

  function more() {
    var language = "svenska";
    var continent = "europe";
    callingCode = 46;
  }
}

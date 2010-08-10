angular.scenario.dsl.browser = {
  navigateTo: function(url){
    return $scenario.addFuture('Navigate to: ' + url, function(done){
      var self = this;
      this.testFrame.load(function(){
        self.testFrame.unbind();
        self.testWindow = self.testFrame[0].contentWindow;
        self.testDocument = self.jQuery(self.testWindow.document);
        self.$browser = self.testWindow.angular.service.$browser();
        self.notifyWhenNoOutstandingRequests =
          bind(self.$browser, self.$browser.notifyWhenNoOutstandingRequests);
        self.notifyWhenNoOutstandingRequests(done);
      });
      if (this.testFrame.attr('src') == url) {
        this.testFrame[0].contentWindow.location.reload();
      } else {
        this.testFrame.attr('src', url);
      }
    });
  }
};

angular.scenario.dsl.input = function(selector) {
  var namePrefix = "input '" + selector + "'";
  return {
    enter: function(value) {
      return $scenario.addFuture(namePrefix + " enter '" + value + "'", function(done) {
        var input = this.testDocument.find('input[name=' + selector + ']');
        input.val(value);
        this.testWindow.angular.element(input[0]).trigger('change');
        done();
      });
    },
    select: function(value) {
      return $scenario.addFuture(namePrefix + " select '" + value + "'", function(done) {
        var input = this.testDocument.
          find(':radio[name$=@' + selector + '][value=' + value + ']');
        jqLiteWrap(input[0]).trigger('click');
        input[0].checked = true;
        done();
      });
    }
  };
},

angular.scenario.dsl.repeater = function(selector) {
  var namePrefix = "repeater '" + selector + "'";
  return {
    count: function() {
      return $scenario.addFuture(namePrefix + ' count', function(done) {
          done(this.testDocument.find(selector).size());
      });
    },
    collect: function() {
      return $scenario.addFuture(namePrefix + ' collect', function(done) {
        var self = this;
        var doCollect = bind(this, function() {
          var repeaterArray = [];
          this.testDocument.find(selector).each(function() {
            var element = angular.extend(self.jQuery(this),
                {bindings: [],
                 boundTo: function(name) { return this.bindings[name]; }}
            );
            element.find('*').each(function() {
              var bindName = self.jQuery(this).attr('ng:bind');
              if (bindName) {
                element.bindings[bindName] = self.jQuery(this).text();
              }
            });
            repeaterArray[index] = element;
          });
          return repeaterArray;
        });
        done(doCollect());
      });
    }
  };
};

angular.scenario.dsl.element = function(selector) {
  var nameSuffix = "element '" + selector + "'";
  return $scenario.addFuture('Find ' + nameSuffix, function(done) {
    var self = this;
    var element = angular.extend(this.testDocument.find(selector), {
      bindings: [],
      boundTo: function(name) { return this.bindings[name]; }
    });
    element.find('*').each(function() {
      var bindName = self.jQuery(elem).attr('ng:bind');
      if (bindName) {
        element.bindings[bindName] = self.jQuery(elem).text();
      }
    });
    done(element);
  });
};
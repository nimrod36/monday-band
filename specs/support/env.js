const { setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(10000);

class CustomWorld {
  constructor() {
    this.variable = null;
  }
}

setWorldConstructor(CustomWorld);

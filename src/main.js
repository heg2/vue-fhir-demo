import Vue from 'vue'
import App from './App.vue'
import { JSOnFhir } from '@i4mi/js-on-fhir'

// create a new fhir object with the credentials needed for your application
const fhir = new JSOnFhir('http://test.midata.coop', 'vue-fhir-demo', 'http://localhost:8080');

// Add a getter for this fhir object to the Vue prototype. This makes it available from every component.
Object.defineProperties(Vue.prototype, {
  // using a $ sign for the name is not necessary, but convention
  $fhir: {
    get: function() {
      return fhir;
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app')

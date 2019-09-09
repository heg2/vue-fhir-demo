<template>
  <div id="app">
    <h1>Vue on FHIR</h1>
    <p>This is a demo app for the jsOnFhir wrapper on Vue.js.</p>
    <p v-if="loggedIn">As you can see, you have several actions available. See your browsers console for further information.</p>
    <ul v-if="loggedIn">
      <li>
        <a @click="search">search</a>
      </li>
      <li>
        <a @click='create'>create resource</a>
      </li>
      <li v-if="resource!=''">
        <a @click='update'>update resource</a>
      </li>
      <li>
        <a @click="logout">log out</a>
      </li>

    </ul>
    <ul v-else>
      <li>
        <a @click="login">log in</a>
      </li>
      <li v-if="rToken">
        <a @click="refresh">log in directly (with refresh token)</a>
      </li>
    </ul>
    <p id="screen" v-if="screen!= ''">
      {{ screen }}
    </p>
  </div>
</template>

<script>

export default {
  name: 'app',
  components: {
  },
  data(){
    return {
      rToken: "",
      loggedIn: false,
      screen: "",
      searchType: 'Observation',
      searchParam: {
        date: 'ge2019-09-01'
      },
      resource: ""
    }
  },
  methods: {
    login(){
      // we start the two-step auth process by calling authenticate() method

      this.$fhir.authenticate();

      // what happens next is handled in mounted(), because the server calls our redirect-url
      // (localhost:8080), which reloads this page
    },

    logout(){
      // destroy auth information by calling logout()
      this.$fhir.logout();

      // keep track of logged in state for the GUI
      this.loggedIn = this.$fhir.isLoggedIn();
      console.log("logged out", !this.$fhir.isLoggedIn());
    },

    search(){
      this.$fhir.search(this.searchType, this.searchParam).then(result => {
        console.log('search result:',result);
        this.screen = 'Found ' + result.total + ' resources of type ' + this.searchType + '. See console for results.';
      })
      .catch(err => {
        console.log(err);
      });
    },

    create(){

    },

    update(){

    },


    refresh(){
      this.$fhir.refreshAuth(this.rToken).then(res =>{
        this.rToken = res.refresh_token;
        this.loggedIn = this.$fhir.isLoggedIn();
        console.log('refresh:', res);
      });
    },
  },
  mounted(){
    // check login status for GUI
    this.loggedIn = this.$fhir.isLoggedIn();

    // handle server response in auth process
    this.$fhir.handleAuthResponse()
    .then(res => {
      if(res){ // when not in auth process, res is NULL and we skip this part
        this.rToken = res.refresh_token;
        this.loggedIn = this.$fhir.isLoggedIn();
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a {
  color: orange;
  font-weight: bold;
}
a:hover {
  color: black;
}
p, ul {
  text-align: justify;
  margin-left: 20%;
  margin-right: 20%;
}
p#screen {
  margin-left: 10%;
  margin-right: 10%;
  font-family: Courier, serif;
  display: block;
  text-align: left;
  color: #EEEEEE;
  background: black;
  padding: 5px;
}
</style>

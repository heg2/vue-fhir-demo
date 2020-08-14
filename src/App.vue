<template>
  <div id="app">
    <h1>Vue on FHIR</h1>
    <p>This is a simple demo app for the jsOnFhir wrapper on Vue.js.</p>
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
    <p id="display" v-if="display!= ''">
      {{ display }}<br /><br />
      See browser console for details.
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
      // rToken is where we keep the refresh token after successful authentification
      rToken: '',
      // searchType defines the type of the resource you want to search
      searchType: 'Observation',
      // searchParam defines the parameters for your search (can be null)
      searchParam: {
        date: 'ge2019-09-01'
      },
      // resource is the resource that will be created on the server
      resource: {
        "resourceType": "Observation",
        "status": "preliminary",
        "category": [
          {
            "coding": [
              {
                "system": "http://hl7.org/fhir/observation-category",
                "code": "survey",
                "display": "Survey"
              }
            ]
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "65554-8",
              "display": "Time to wakeup"
            }
          ]
        },
        "effectivePeriod": {
          "start": "2019-09-02T20:00:00.000Z",
          "end": "2019-09-03T04:00:00.000Z"
        },
        "component": [
          {
            "code": {
              "coding": [
                {
                  "system": "http://snomed.info/sct",
                  "code": "248254009",
                  "display": "Sleep pattern finding"
                }
              ]
            },
            "valueQuantity": {
              "value": 5
            }
          }
        ]
      },
      // loggedIn keeps track of the logged in state (for GUI adjustment)
      loggedIn: false,
      // display shows some results of the actions
      display: '',
    }
  },

  // methods are used for click events only in this app
  methods: {
    login(){
      // we start the two-step auth process by calling authenticate() method

      this.$fhir.authenticate();

      // all that happens next is handled in mounted(), because the server calls our redirect-url
      // (localhost:8080), which reloads this page
    },

    logout(){
      // destroy auth information by calling logout()
      this.$fhir.logout();

      // keep track of logged in state for the GUI
      this.loggedIn = this.$fhir.isLoggedIn();
      console.log("Logged out", !this.$fhir.isLoggedIn());

      // clear display
      this.display = '';
    },

    search(){
      // for search we use the search method
      // searchType is mandatory and describes the type of the resource to be searched for
      //  searchParam can be used for configuring the search (e.g. only resources after a certain date)
      this.$fhir.search(this.searchType, this.searchParam)
      .then(result => {
        this.display = 'Found ' + result.total + ' resources of type <' + this.searchType + '>.';
        console.log('Search result:',result);
      })
      .catch(err => {
        this.display = 'Oops. Something went wrong.';
        console.log(err);
      });
    },

    create(){
      // this is straight-forward: just use the create() method with our predefined resource
      this.$fhir.create(this.resource)
      .then(res => {
        this.display = 'Created resource with id=' + res.id + '.';
        console.log('Created resource', res);

        // we save the resource, so we can "update" it later
        this.resource = res;
      })
      .catch(err => {
        this.display = 'Oops. Something went wrong.';
        console.log('something went wrong while creating a resource ', err);
      })
    },

    update(){
      // without a correct resource id set, the FHIR server can not identify the resource
      // and thus not update it
      if(!this.resource.id || this.resource.id == ''){
        this.display = 'Resource needs correct id for updating. Click "create resource" first.';
      }
      else {
        // if the resource has an ID, it can be updated using the update() method
        // (even when we haven't changed anything in the resource ;-) )
        this.$fhir.update(this.resource)
        .then(res =>{
          this.display = 'Resource updated.';
          console.log('Resource updated: ', res);
        })
        .catch(err => {
          this.display = 'Oops. Something went wrong.';
          console.log('Something went wrong while updating resource: ', err);
        });
      }
    },

    refresh(){
      // pass the previously got refresh token to the refreshAuth method to login
      // without having the user entering his credentials
      this.$fhir.refreshAuth(this.rToken)
      .then(res =>{
        // when sucessful, we have to save the new refresh token
        this.rToken = res.refresh_token;
        this.loggedIn = this.$fhir.isLoggedIn();
        console.log('refresh:', res);
      })
      .catch(err => {
        console.log('something went wrong while refreshing auth: ', err);
      });
    },
  },

  // mounted() is executed every time the component is mounted
  mounted(){
    // check login status for GUI
    this.loggedIn = this.$fhir.isLoggedIn();

    // handle servers response in auth process
    this.$fhir.handleAuthResponse()
    .then(res => {
      if(res){ // when not in auth process, res is NULL and we skip this part
        // we get a refresh token, that we can use to re-authenticate later
        this.rToken = res.refresh_token;

        // let's keep track of the login state
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
  max-width: 600px;
}
a {
  color: orange;
  font-weight: bold;
}
a:hover {
  color: black;
}
li {
  list-style-type: none;
  text-align: left;
}
p, ul {
  text-align: justify;
  margin-left: 20%;
  margin-right: 20%;
}
p#display {
  margin-top : 50px;
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

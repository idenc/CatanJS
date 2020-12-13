<template>
    <div id="overlay" class="main">
        <div id="overlayin" class="trade">
            <p class="big"> Choose someone to trade with: </p>
            <li v-for="user in users"
                :key="user.username"
                :style="{'color': 'white', 'list-style':'none'}"
            >
                <div v-if="username !== user.username"
                    :id="'user-row'" 
                    :class="user.username"
                >
                    <div id="name">
                        <p class="big">{{ user.username }}</p>
                    </div>
                    <button 
                        :class="'btn btn-primary btn-block'"
                        @click="tradeRequest(user.username)"
                    >
                        Request
                    </button>
                </div>
            </li>
            
            <li
                :key="'bank'"
                :style="{'color': 'white', 'list-style':'none'}"
            >
                <div 
                    :id="'user-row'" 
                    :class="$socket.username"
                >
                    <div id="name">
                    <p class="big">Bank</p>
                    </div>
                    <button 
                        :class="'btn btn-primary btn-block'"
                        @click="tradeRequest('bank')"
                    >
                        Request
                    </button>
                </div>
            </li>
            
            <button
                :id="'cancelButton'"
                :class="'btn btn-primary btn-block'"
                @click="cancelTrade('#overlayin.trade')"
            >
                Cancel
            </button>
            <p id="reqSent" class="big">Request sent, please wait...</p>
        </div>
        <div id="overlayin" class="tradeOptions">
            <p id="tradeMsg" class="big">Someone would like to trade with you</p>
            <button
                :class="'btn btn-primary btn-block'"
                @click="acceptTrade()"
            >
                Accept
            </button>
            <button
                :class="'btn btn-primary btn-block'"
                @click="declineTrade()"
            >
                Decline
            </button> 
        </div>

        <div id="overlayin" class="tradeMenu">
            <div id="flexBox">
                <div id="column1">
                    <form>
                        <div id="users">
                            <div id='dealer'>
                                <p class="big">{{ this.$socket.username }}</p>
                            </div>
                            <div id='customer'>
                                <p class="big">{{ this.$socket.tradePlayer }}</p>
                            </div>
                        </div>
                        <p class="big">Receive</p>
                        <div id="recResources"> 

                            <div id='clay'
                                style="background-image: url(../img/clay.4909ff26.svg);">
                                <input type='text'
                                    id='clay' 
                                    class='receive'
                                    value='0'
                                >
                            </div>
                            <p id="clayTradeType2">1:4</p>



                            <div id='wood'
                                style="background-image: url(../img/wood.150c9050.svg);">
                                <input type='text'
                                    id='wood' 
                                    class='receive'
                                    value='0'
                                >
                            </div>
                            <p id="clayTradeType2">1:4</p>


                            <div id='sheep'
                                style="background-image: url(../img/sheep.05d7205f.svg);">
                                    <input type='text'
                                        id='sheep' 
                                        class='receive'
                                        value='0'
                                    >
                            </div>
                            <p id="clayTradeType2">1:4</p>


                            <div id='wheat'
                                style="background-image: url(../img/wheat.1d358e8c.svg);">
                                <input type='text'
                                    id='wheat' 
                                    class='receive'
                                    value='0'
                                >
                            </div>
                            <p id="clayTradeType2">1:4</p>


                             <div id='ore'
                                    style="background-image: url(../img/ore.a4c31667.svg);">
                                    <input type='text'
                                        id='ore' 
                                        class='receive'
                                        value='0'
                                    >
                                </div>
                            <p id="clayTradeType2">1:4</p>

                            
                        </div>
                        <p class="big">Offer</p>
                        <div id="offResources">

                                <div id='clay'
                                style="background-image: url(../img/clay.4909ff26.svg);">
                                <input type='text'
                                    id='clay' 
                                    class='offer'
                                    value='0'
                                >
                                </div>
                                <p id="clayTradeType1">4:1</p>
                                


                                <div id='wood'
                                    style="background-image: url(../img/wood.150c9050.svg);">
                                    <input type='text'
                                        id='wood' 
                                        class='offer'
                                        value='0'
                                    >
                                </div>
                                <p id="clayTradeType1">4:1</p>
                                

                                <div id='sheep'
                                    style="background-image: url(../img/sheep.05d7205f.svg);">
                                    <input type='text'
                                        id='sheep' 
                                        class='offer'
                                        value='0'
                                    >
                                </div>
                                <p id="clayTradeType1">4:1</p>
                                

                                <div id='wheat'
                                    style="background-image: url(../img/wheat.1d358e8c.svg);">
                                    <input type='text'
                                        id='wheat' 
                                        class='offer'
                                        value='0'
                                    >
                                </div>
                                <p id="clayTradeType1">4:1</p>
                                

                                <div id='ore'
                                    style="background-image: url(../img/ore.a4c31667.svg);">
                                    <input type='text'
                                        id='ore' 
                                        class='offer'
                                        value='0'
                                    >
                                </div>
                                <p id="clayTradeType1">4:1</p>

                        </div>
                    </form>
                </div>
                <div id="column2">
                    <div id="buttons">
                        <button 
                            id="cancel" 
                            class="btn btn-primary btn-block"
                            @click="cancelTrade('#overlayin.tradeMenu')"
                        >
                            Cancel
                        </button>
                        <button id="offer" 
                            class="btn btn-primary btn-block"
                            @click="offerTrade()">
                            Offer
                        </button>   
                        <button id="reset" 
                            class="btn btn-primary btn-block"
                            @click="resetFields()">
                            Reset
                        </button>
                        <button id="accept" 
                            class="btn btn-primary btn-block"
                            @click="acceptTrade()">
                            Accept
                        </button>
                    </div>
                </div>
                <div id="column3">
                    <p class="big">All trades are 4:1 unless you own a harbour that allows to better rates.</p>
                    <ul id="harboursOwned"> Harbours Owned:
                        <li id="genericHarbour">Generic Harbour: 3:1 for every resource</li>
                        <li id="specialHabour" class="clay">Clay Special Harbour: 2 clay:1 any resource</li>
                        <li id="specialHabour" class="wood">Wood Special Harbour: 2 wood:1 any resource</li>
                        <li id="specialHabour" class="wheat">Wheat Special Harbour: 2 wheat:1 any resource</li>
                        <li id="specialHabour" class="sheep">Sheep Special Harbour: 2 sheep:1 any resource</li>
                        <li id="specialHabour" class="ore">Ore Special Harbour: 2 ore:1 any resource</li>
                    </ul>

                </div>
            </div>
        </div>

        <div id="overlayin" class="mute">
            <p class="big">You have been muted. You can no longer send chat messages.</p>
            <p class="dark">Click anywhere to dismiss.</p>
        </div>

        <div id="overlayin" class="unmute">
            <p class="big">You have been unmuted. You can now send chat messages.</p>
            <p class="dark">Click anywhere to dismiss.</p>
        </div>

        <div id="overlayin" class="kicked">
            <p class="big">You have been kicked. You will be returned to the login menu.</p>
            <p class="dark">Click anywhere to dismiss.</p>
        </div>

        <div id="overlayin" class="player">
            <p class="big">Sorry, these options are for the host!</p>
            <p class="dark">Click anywhere to dismiss.</p>
        </div>

        <div id="overlayin" class="tradeCancel">
            <p class="big">The other player has canceled the trade.</p>
            <p class="dark">Click this box to dismiss.</p>
        </div>

        <div id="overlayin" class="invalidTrade">
            <p class="big">Invalid trade, must give and receive at least 1 resource.</p>
            <p class="dark">Click anywhere to dismiss.</p>
        </div>

    </div>
</template>

<script>
"use strict";



export default {

    name: "Overlay",
    data() {
        return {
            users: this.$socket.users,
            username: this.$socket.username,
            resources: [
                ('clay',"..\\assets\\svg\\clay.svg"),
                ['lumber','..\\assets\\svg\\wood.svg'],
                ['wool','..\\assets\\svg\\sheep.svg'],
                ['grain', '..\\assets\\svg\\wheat.svg'],
                ['ore','..\\assets\\svg\\ore.svg']
            ]
        }
    },
    mounted: function () {

        

        this.sockets.subscribe('trade_request', (userList) => {
            var dealer = userList[0];
            var customer = userList[1];
            console.log(customer);
            console.log(dealer);
            console.log(this.$socket.username);
            if (this.$socket.username === customer) {
                this.$socket.tradePlayer = dealer;
                document.getElementById("tradeMsg").innerHTML = dealer + " would like to trade with you.";
                document.querySelector("#overlay.main").classList.add("active");
                document.querySelector("#overlayin.tradeOptions").classList.add("active");
            }
        });

        this.sockets.subscribe('trade_cancel', (username) =>{
            if (this.$socket.username == username) {
                document.querySelector("#overlayin.tradeMenu").classList.remove("active");
                document.querySelector("#overlayin.tradeCancel").classList.add("active");
                document.querySelector("#overlay.main").addEventListener("click", () => {
                    document.querySelector("#overlay.main").classList.remove("active");
                    document.querySelector("#overlayin.tradeCancel").classList.remove("active");
                });
                document.querySelector("#overlay.main").classList.remove("active");
                this.toggleButtons(false);
            }
        });

        this.sockets.subscribe('trade_accept', (userList) => {
            console.log("getting callback!!!");
            var dealer = userList[0];
            var customer = userList[1];
            console.log(dealer);
            console.log(this.$socket.username);

            if (this.$socket.username == dealer) {
                this.$socket.tradePlayer = customer;
                document.querySelector("#overlayin.trade").classList.remove("active");
                document.getElementById("cancelButton").disabled = false;
                this.tradeMenu(dealer, customer);
            } else if (this.$socket.username == customer) {
                this.$socket.tradePlayer = dealer;
                document.querySelector("#overlayin.tradeOptions").classList.remove("active");
                this.tradeMenu(customer, dealer);
            }
        });

    },

    methods: {
        attemptTrade() {
            this.username = this.$socket.username;
            this.users = this.$socket.users;
        //   console.log(this.$socket.users);
            document.querySelector("#overlay.main").classList.add("active");
            document.querySelector("#overlayin.trade").classList.add("active");
    },

        tradeRequest(username) {
        if (username === 'bank') {
            this.$socket.tradePlayer = 'Bank';
            document.querySelector("#overlayin.trade").classList.remove("active");
            this.tradeMenu(this.$socket.username, 'bank');
        } else {
            // var dealer = this.$socket.username;
            // var customer = username;
            var userList = [this.$socket.username, username];
            document.getElementById("cancelButton").disabled = true;
            this.$socket.emit('trade_offer', (userList));
        }
        
        },

        tradeMenu(dealer, customer) {
            document.querySelector('#dealer').innerHTML = dealer;
            document.querySelector('#customer').innerHTML = customer;
            if (customer == 'bank') {
                document.querySelector('#column3').classList.add("active");
                document.querySelector("#offer").disabled = true;
            }
            document.querySelector("#overlayin.tradeMenu").classList.add("active");
            this.toggleButtons(true);
        },

        cancelTrade(txt) {
            document.querySelector(txt).classList.remove("active");
            document.querySelector("#overlay.main").classList.remove("active");
            
            if (this.$socket.tradePlayer !== 'Bank') {
                this.$socket.emit('trade_cancel', this.$socket.tradePlayer);
                this.$socket.tradePlayer = '';
            } else {
                document.querySelector('#column3').classList.remove("active");
                document.querySelector("#offer").disabled = false;
            }
            this.toggleButtons(false);
            if (this.$socket.tradePlayer !== '') {
                this.$socket.emit('trade_cancel', this.$socket.tradePlayer);
                this.$socket.tradePlayer = '';
            }
        },

        toggleButtons(check) {
            document.querySelector("#buildButton").disabled = check;
            document.querySelector("#tradeButton").disabled = check;      
            document.querySelector("#dev_cardsButton").disabled = check;
            document.querySelectorAll("#kick-button").forEach((button) => {
                button.disabled = check;
            });
            document.querySelectorAll("#mute-button").forEach((button) => {
                button.disabled = check;
            });
        },
        
        resetFields() {
            document.querySelector("#clay.receive").value = 0;
            document.querySelector("#wood.receive").value = 0;
            document.querySelector("#sheep.receive").value = 0;
            document.querySelector("#wheat.receive").value = 0;
            document.querySelector("#ore.receive").value = 0;

            document.querySelector("#clay.offer").value = 0;
            document.querySelector("#wood.offer").value = 0;
            document.querySelector("#sheep.offer").value = 0;
            document.querySelector("#wheat.offer").value = 0;
            document.querySelector("#ore.offer").value = 0;


        },

        offerTrade(type) {
            var clayRec = document.querySelector("#clay.receive").value;
            var woodRec = document.querySelector("#wood.receive").value;
            var sheepRec = document.querySelector("#sheep.receive").value;
            var wheatRec = document.querySelector("#wheat.receive").value;
            var oreRec = document.querySelector("#ore.receive").value;

            var clayOff = document.querySelector("#clay.offer").value;
            var woodOff = document.querySelector("#wood.offer").value;
            var sheepOff = document.querySelector("#sheep.offer").value;
            var wheatOff = document.querySelector("#wheat.offer").value;
            var oreOff = document.querySelector("#ore.offer").value;

            if (type == 'domestic') {
                
                var clayTradeType = document.querySelector("#clayTradeType");
                var woodTradeType = document.querySelector("#woodTradeType");
                var sheepTradeType = document.querySelector("#sheepTradeType");
                var wheatTradeType = document.querySelector("#wheatTradeType");
                var oreTradeType = document.querySelector("#oreTradeType");
            } else {
                var totalRec = clayRec + woodRec+ sheepRec+ wheatRec+ oreRec;
                var totalOff = clayOff + woodOff + sheepOff + wheatOff + oreOff;
                if (totalOff == 0 || totalRec == 0) {
                    document.querySelector("#overlayin.tradeMenu").classList.remove("active");
                    document.querySelector("overlayin.invalidTrade").classList.add("active");
                    document.querySelector("#overlay.main").addEventListener("click", () => {
                        document.querySelector("#overlayin.invalidTrade").classList.remove("active");
                        document.querySelector("#overlayin.tradeMenu").classList.add("active");
                    });
                }
                this.$socket.emit('trade_cond', this.$socket.tradePlayer);


            }
            

        },

        acceptTrade() {
            var userList = [this.$socket.tradePlayer, this.$socket.username];
            this.$socket.emit('trade_accept', (userList));
        },

        declineTrade() {
            this.$socket.emit('trade_refuse', (this.$socket.tradePlayer, this.$socket.username));
        }

  }


}
</script>

<style scoped>

#column3 {
    display: none;
    visibility: hidden;
}

#column3.active {
    visibility: visible;
    display: block;
}

/* #recResources div, #offResources div {
    width: 20%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
} */

#recResources p, #offResources p {
    visibility: hidden;
}

#overlayin.tradeMenu {
    width: 70%;
    top: 0;
    left: 0;

}

#recResources, #offResources {
    display:flex;
    flex-direction: row;

    justify-content: space-between;
    /* align-items: stretch; */
}

#recResources div, #offResources div {
    height: 6em;
}

#user-row {
  width: 100%;
  display: flex;
  /* height: 100%; */
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: space-between;
  align-items: center;
  justify-content: space-between;
  padding: 1%;

  
}

#users {
    display: flex;
    flex-direction: row;

}

#dealer, #customer {
    width: 100%;
    height: fit-content;
}

#flexBox {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    align-content: center;
}

#column1, #column2 {

    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    align-content: center;
}

#column2 {
    margin-top: 1em;
}

#buttons {
    display: flex;
    flex-direction: row;
    width: 100%;

    
}

#buttons button {
    margin: 3px;
}

#overlayin.tradeMenu button {
    width: 90%;
}



#column1 input {
    display: flex;
    width: 25px;
    height: 20px;
    margin-right: 4em;
    margin-top: 4em;
}

#column1 div {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
}




#user-row div { 
  width: 30%;

}

#overlayin button {
  width: 50%;
}

#overlay.main  *{
  pointer-events: all;
}

#overlayin li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
}

#overlayin.trade li {
    width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
}


/* #overlayin.trade {
  width: 30%;
} */

/* #overlayin div {
  width: 50%;
} */


#overlay {
  position: fixed;
  top: 0;
  left: 0;
  width:100%;

  height: 100%;
  /* background: rgba(0, 0, 0, 0.856); */
  z-index: 999;
  opacity: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: 0s;
  transition: all 0s;

  visibility: hidden;
  animation: fadeOut 0.5s;
  animation-fill-mode: forwards;
}

#overlayin.tradeMenu {
    margin-right: 20%;
    margin-bottom: 30%;
}

#overlay * {
  pointer-events: none;
}

#overlay.active {
  visibility: visible;
  animation: fadeIn 0.5s;
  animation-fill-mode: forwards;
}

#overlayin {
  width: 40%;
  visibility: hidden;
  padding: 1em;
  padding-left: 4em;
  padding-right: 4em;
  background-color: #1b75bb;
  border-radius: 5px;
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: rgb(255, 255, 255);
  box-shadow: 0 0 20px black;
}

#overlayin.trade  {
  background-color:  #1b75bb;
}

/* #overlayin.tradeOptions {
  width: 30%;
   height: 10%; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
  padding: 1%;
  background-color:  #1b75bb;
} */

.tradeOptions button{
  
  padding: 1%;
  width: 100%;
}

/* #overlayin * {
    margin: 0px;
  } */

#overlayin.active {
  display: flex;
  visibility: visible;
}
  
#overlayin p {
  text-align: center;
  font-size: 1em;
}

p.big {
  font-size: 2em !important;
}

p.darker {
  color: #aaa;
}


</style>
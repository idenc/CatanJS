<template>
    <div class="modal">
      <header class="modal-header">
        <div class='buy-button'>
          <div class='buy' @click="buyDevCard()">Buy</div>
        </div>
        <div class='requires-container'>
          <div class='requires' resource='ore'>
            <img class='requires-icon' src="..\assets\svg\ore.svg"/>
            <div>
              <span class="resource-count">1</span>
            </div>
          </div>
          <div class='requires' resource='wood'>
            <img class='requires-icon' src="..\assets\svg\wood.svg"/>
            <div>
              <span class="resource-count">1</span>
            </div>
          </div>
          <div class='requires' resource='wheat'>
            <img class='requires-icon' src="..\assets\svg\wheat.svg"/>
            <div>
              <span class="resource-count">1</span>
            </div>
          </div>
        </div>
      </header>
      <section class="modal-body">
        <div>
          <div class="flex-container">
            <div class='knight-card'>
              <h5><b>Knight</b></h5>
              <div class='knight-des'>
                Move the robber. Steal 1 resource from the owner of a settlement or city adjacent
                to the robber's new hex. 
              </div>
              <div class='knight-number'>
                {{devCardCount.knight}}x
              </div>
            </div>
            <div class='road-building-card'>
              <h5><b>Road Building</b></h5>
              <div>
                Place 2 roads.
              </div>
              <div class='road-number'>
                {{devCardCount.roadBuilding}}x
              </div>
            </div>
            <div class='year-of-plenty-card'>
              <h5><b>Year of Plenty</b></h5>
              <div>
                Draw 2 resource cards.
              </div>
              <div class='yearOfPlenty-number'>
                {{devCardCount.yearOfPlenty}}x
              </div>
            </div>
            <div class='monopoly-card'>
              <h5><b>Monopoly</b></h5>
              <div>
                Steal 1 type of resource from all.
              </div>
              <div class='monopoly-number'>
                {{devCardCount.monopoly}}x
              </div>
            </div>
            <div class='victory-point-card'>
              <h5><b>Victory Point Cards</b></h5>
              <h6><b>1 Victory Point!</b></h6>
              <div>
                Reveal this card on your turn if, with it, you reach the number of points required for victory.
              </div>
              <div class='victoryPoint-number'>
                {{devCardCount.victoryPoint}}x
              </div>
            </div>
          </div>
        </div>
       </section>
    </div>
</template>

<script>
export default {
    name: 'DevCardModal',
    data(){
      return{
        devCardCount: {
          knight: 0,
          roadBuilding: 0,
          yearOfPlenty: 0,
          monopoly: 0,
          victoryPoint: 0
        }
      }
    },
    methods: {
      buyDevCard(){
        this.$emit('build_dev_card');
      }
    }
}
</script>

<style>
  .modal {
    background: #1b75bb;
    top: 0;
    left: 0;
    width: 71%;
    height: 100%;
    
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header{
    position: relative;
    padding: 40px;
    display: flex;
    border-bottom: 1px solid #eeeeee;
    justify-content: space-between;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
  }

  .buy-button{
      position: absolute;
      background-color: green;
      top: 0;
      left: 0;
      height: 100%;
      width: 10%;
      cursor: pointer;
    }

  .buy{
      position: absolute;
      color: white;
      width: 100%;
      justify-content: center;
      top: 35%;
  }

  .requires-container{
    position: absolute;
    display: flex;
    flex-direction: row;
    color: white;
    top: 5%;
    left: 12%;
  }

  .requires{
    display: flex;
    flex-direction: row;
    border-radius: 1rem;
    align-items: center;
    padding: 0.5em;
    margin: 0.5em;
  }

  .requires[resource='ore']{
    background: #4d4d4d;
  }

  .requires[resource='wood']{
    background: green;
  }

  .requires[resource='wheat']{
    background: #cf9800;
  }

  .requires-icon{
    height: 3em;
    width: 3em;
    margin-right: 2em;
  }

  .knight-card{
    position: absolute;
    border-radius: 5px;
    border: 3px solid purple;
    background-color: white;
    height: 94%;
    width: 30%;
    cursor: pointer;
  }

  .road-building-card{
    position: absolute;
    border-radius: 5px;
    border: 3px solid lightgreen;
    background-color: white;
    height: 30%;
    width: 30%;
    left: 35%;
    top: 3%;
    cursor: pointer;
  }

  .year-of-plenty-card{
    position: absolute;
    border-radius: 5px;
    border: 3px solid lightgreen;
    background-color: white;
    height: 30%;
    width: 30%;
    left: 35%;
    top: 35%;
    cursor: pointer;
  }

  .monopoly-card{
    position: absolute;
    border-radius: 5px;
    border: 3px solid lightgreen;
    background-color: white;
    height: 30%;
    width: 30%;
    left: 35%;
    top: 67%;
    cursor: pointer;
  }

  .victory-point-card{
    position: absolute;
    border-radius: 5px;
    border: 3px solid orange;
    background-color: white;
    height: 94%;
    width: 30%;
    left: 69%;
    cursor: pointer;
  }
  </style>
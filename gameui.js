/**global document*/
/**global Panel*/
/**global QLearner*/
/**global setTimeout*/

let GameUI =
{
    init: function()
    {
        this.goalsDiv = document.getElementById( "goalsDiv" );
        this.iterationsDiv = document.getElementById( "iterationsDiv" );
        this.rewardDiv = document.getElementById( "rewardDiv" );
        this.randomDiv = document.getElementById( "randomDiv" );
        this.update();
    },
    
    update: function()
    {
        this.goalsDiv.innerHTML = Panel.goalsReached;
        this.iterationsDiv.innerHTML = Panel.iterations;
        this.rewardDiv.innerHTML = QLearner.totalReward;
        this.randomDiv.innerHTML = QLearner.lastJumpWasRandom;
    }
};
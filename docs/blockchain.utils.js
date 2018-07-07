//
// A Collection of functions to work with blockchain (array of blocks)
//

  //
  // Returns a concise toString of the chain.
  //
  function toShortString(chain) {
	var array = [];
    for (var i=0;i<chain.length;i++) {
	  array[i] = chain[i].id;
    }
    return array.join(',');
  }
		
  //
  // It creates a new block/transaction and adds it to this chain. 
  // 
  // This method checks that the sender has enough funds to transfer.
  // If not, it returns a string explaining the issue.
  //
  // if the sender is 'Genesis' (aka the genesis block) no check on funds occur. 
  // In other words, the genesis block creates money out of thin air.
  //
  function addBlock(chain, id, sender, amount, receiver) {
		                        // program errors
	if (sender == receiver) throw 'sender == receiver ['+sender+']';
	if (amount < 0)         throw 'invalid amount ['+amount+']';
	  
    var timestamp = (function toHHMMSS() {
	  var d = new Date();
	  var h = d.getHours();
      var m = d.getMinutes();
	  var s = d.getSeconds();
      return ((h < 10) ? '0'+h : h) + ':' + ((m < 10) ? '0'+m : m) + ':' + ((s < 10) ? '0'+s : s);
	})(); 
	  
	var refIndexes = []; 
	var availAmount = 0; 
	for (var i=chain.length-1;i>=0;i--) {
	  var bk = chain[i];
	  if (bk.outputs[sender]) {
	    // this is a candidate (must verify that the money was not spent already).
	    var wasSpent = false;
	    for (var j=i+1;j<chain.length;j++) {
	      if (chain[j].sender == sender && 
	          chain[j].inputs.indexOf(i) != -1) {
	        // skipping this one;
	        wasSpent = true;
	        break; 
	      }
	    }
	    if (wasSpent) continue; 
	       
	    refIndexes.push(i); 
	    availAmount += bk.outputs[sender];
	      
	    if (availAmount == amount) {
	      var oj = {
	        id : id,
	        timestamp : timestamp,
	        sender : sender,
	        inputs : refIndexes,
	        outputs : {}
	      }
	      oj.outputs[receiver] = amount;
	      chain.push(oj);
	      return;
	    }
	    if (availAmount > amount) {
	      var oj = {
	        id : id,
	        timestamp : timestamp,
	        sender : sender,
	        inputs : refIndexes,
	        outputs : {}
	      }
	      oj.outputs[receiver] = amount;
	      oj.outputs[sender] =   availAmount - amount;
	      chain.push(oj);
	      return;
	    } 
	  }
    }
	if (sender == 'Genesis') {
	  var oj = {
	    id : id,
	    timestamp : timestamp,
	    sender : 'Genesis',
	    inputs : [],
	    outputs : {}
	  };
	  oj.outputs[receiver] = amount;
	  chain.push(oj);
	  return; 
	}
	return 'Transaction Rejected [ ('+id+') '+sender+' gives '+amount+' to '+receiver+ '] - '+sender+'\'s available money:'+availAmount; 
  }

  //
  // calculates the ledger from scratch traversing the chain.
  // It excludes the 'Genesis' from the ledger.
  //
  function calculateLedger(chain) {
	var ledger = {};
	for (var i=0;i<chain.length;i++) {
	  var sender = chain[i].sender;
	  var outputs = chain[i].outputs;
	  var sum = 0; 
	  for (var j in outputs) {
	    if (ledger[j] == null) ledger[j] = 0; 
	    ledger[j] += outputs[j]; 
	    sum+=outputs[j] 
	  }
	  if (ledger[sender] == null) ledger[sender] = 0;
	  ledger[sender]-=sum; 
    }
	delete ledger['Genesis']; 
	return ledger; 
  }

  //
  // creates a valid transaction (e.g. Joe gives 500 to Alice) and returns it.
  // this method expects an array of receivers (e.g. Joe, Jeff, Charlotte) to choose from. 
  //
  function createRandomBlock(chain, receivers) {
    var ledger = calculateLedger(chain);
	var array = Object.keys(ledger);
	  
	// program error.
	if (array.length == 0)                                                      throw 'Invalid. Ledger is empty. Bootstrap with a "genesis" block'
	if (array.length == 1 && receivers.length == 1 && array[0] == receivers[0]) throw 'Invalid. One sender/receiver only ['+array[0]+']';
	if (receivers.length == 0)                                                  throw 'Empty receiver array';
	  
	while (true) {
	  var i = Math.floor(Math.random()*array.length);
	  var sender = array[i];
	  if (sender == 'Genesis') continue; 
	  if (ledger[sender] < 10) continue;
	    
	  var pcg = [0.5,0.8,1.0][Math.floor(Math.random()*3)];
	  var amount = Math.floor(ledger[sender] *pcg);
	  if (amount > 10) {
	    amount = Math.floor(amount/10)*10;    
	  }
	        
	  var receiver = receivers[Math.floor(Math.random()*receivers.length)];
	  if (receiver == sender) continue;
	    
	  return {
		sender :   sender, 
		amount :   amount, 
		receiver : receiver
	  };
	}
  };

  
//
// Given two chains A and B, returns -1, 0, or +1 as A is less than, equal to, or greater than B. 
//
// The function must ensure that 
// - compareCost(x,y) == -compareCost(y,x)
// - compareCost(x,y) > 0 && compareCost(y,z) > 0 implies compareCost(x,z) > 0.
// - compareCost(x,y) == 0 implies x == y.
//  
// Examples (showing just the id of the chains)
// compareCost([1,2,3],[1,2,3]) -->  0
// compareCost([1,2,3],[1,2] )  -->  1
// compareCost([1,2,3],[1,2,4]) --> -1 
// 
function compareChainCosts(chainA,chainB) {
  if (chainA.length-chainB.length >=2) return +1;
  if (chainB.length-chainA.length >=2) return -1; 
  var min = Math.min(chainA.length,chainB.length);
  for (var i=0;i<min;i++) {
    if     (chainA[i].id == chainB[i].id) continue;
    return (chainA[i].id <  chainB[i].id) ? -1 : +1;
  }
  return (chainA.length == chainB.length) ? 0  :
         (chainA.length <  chainB.length) ? -1 : +1;
}  

//
// Given chain A and B, returns an array of all blocks in A but not in B.
//
function deltaChain(chainA, chainB) {
  var bSet = {};	
  for (var i=0;i<chainB.length;i++) {
	 bSet[chainB[i].id] = 1;  
  }	
  var blocks = []; 	
  for (var i=0;i<chainA.length;i++) {
	 if (bSet[ chainA[i].id ] == 1) continue;
	 blocks.push(chainA[i]);
  }	
  return blocks;
}

//
// Given a well-formed block from a chain
//
//    {id: 2, timestamp: "10:03:28", sender: "Beverly", inputs: [... ] , outputs: { Joe: 50, Beverly: 40 }}
//
// it derives the intrinsic transaction:
//
//    {id: 2, sender: "Beverly", amount: 50, receiver: "Joe" }
//
function transactionFromBlock(block) {
  for (var i in block.outputs) {
	if (i == block.sender) continue;
    return {
	  id : block.id,  
	  sender : block.sender,
	  receiver : i,
	  amount : block.outputs[i] 
    };
  }
}
	  


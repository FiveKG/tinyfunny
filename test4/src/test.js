let readline = require('readline'); 
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
  });

  rl.question('??',function(answer)
  {
    console.log('1:'+answer);
  })
  rl.question('aaaa',function(answer)
  {
    console.log('2:'+answer);
  })
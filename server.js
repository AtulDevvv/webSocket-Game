const http= require('http')
const {createServer}= http

const express= require('express')
const app=express()

app.listen(3001,()=>{
    console.log(' app listen on port ',3001)
})

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

const webServerSocket= require('websocket').server

const httpServer=createServer();

httpServer.listen(3000,()=>console.log('connected successfully'))

// hashMap

let clients={};

let games={};


 const wsServer=new webServerSocket({
    "httpServer":httpServer
 })

 wsServer.on('request',request=>{
 const connection= request.accept(null,request.origin);
  connection.on('open',()=>{
    console.log('connected succeffully from server side')
  })

  connection.on('close',()=>{
    console.log('connection closed')
  })
  connection.on('message',(message)=>{
    // i have received a message from the client
  const result=JSON.parse(message.utf8Data)


  if(result.method==="create"){
   const  clientId=result.clientId
    const gameId=guid()

    games[gameId]={
        "id":gameId,
        "ball":20,
        "clients":[]
    }

    const payload={
        "method":"create",
        "game":games[gameId]

    }

    const con= clients[clientId].connection
    con.send(JSON.stringify(payload))
  }

    if(result.method==='Join'){
     
      const clientId=result.clientId;
      const gameId=result.gameId;
      const game=games[gameId]
      if(game.clients.length>=3){
        console.log('length is jyada')
        return;

      }

   const color=  {"0":'Red',"1":'Green',"2":'Blue'}[game.clients.length]

   game.clients.push({
    "clientId":clientId,
    "color":color,

   })
   if(game.clients.length===3){
    updateGameState()
   }

   const paylaod={
    "method":"Join",
    "game":game,
   }

   game.clients.map(c=>{
    clients[c.clientId].connection.send(JSON.stringify(paylaod))
   })




    }

    //play

    if(result.method==='play'){
      
      const gameId=result.gameId;
      const ballId=result.ballId;
      const color=result.color;
      


      let  state=games[gameId].state;
      if(!state){
       state={}
      }
      state[ballId]=color;
     games[gameId].state=state;

     


    }



 

})
// genearte a new client id
const  clientId= guid();

clients[clientId]={
    "connection":connection
}


const payload={
    'method':"connect",
    "clientId":clientId,
}
// send back the client connect
connection.send(JSON.stringify(payload))
 })



function updateGameState(){
  for(const g of Object.keys(games)){
    const game=games[g]
    const payload={
      "method":"update",
      "game":game
    }
    games[g].clients.map((c)=>{
      clients[c.clientId].connection.send(JSON.stringify(payload))

    })
  }
  setTimeout(updateGameState,500)
}



function generateFunction(){
    return (((1+Math.random())*0x10000|0).toString(16).substring())
}

const guid=()=>(generateFunction()+generateFunction()+"-"+generateFunction()+"-4"+generateFunction().substring())




